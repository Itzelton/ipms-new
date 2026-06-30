"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

export type Role = 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | null;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

type AuthContextType = {
  user: SessionUser | null;
  session: Session | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchLocalProfile(accessToken: string): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const u = json.data ?? json;
    const roleList: string[] = Array.isArray(u.roles)
      ? u.roles.map((r: any) => (typeof r === 'string' ? r : r.name))
      : [];
    const role: Role =
      roleList.includes('ADMIN') ? 'ADMIN' :
      roleList.includes('SUPERVISOR') ? 'SUPERVISOR' :
      roleList.includes('STUDENT') ? 'STUDENT' : null;
    return { id: u.id, email: u.email, name: u.preferredName || u.firstName || u.email, role };
  } catch {
    return null;
  }
}

async function ensureLocalProfile(accessToken: string): Promise<SessionUser | null> {
  // Try to fetch existing profile first
  const existing = await fetchLocalProfile(accessToken);
  if (existing) return existing;

  // No local profile — attempt auto-create using Supabase user metadata
  try {
    const { data: { user: sbUser } } = await supabase.auth.getUser(accessToken);
    if (!sbUser) return null;

    const meta = sbUser.user_metadata ?? {};
    const name = meta.name || sbUser.email?.split('@')[0] || 'User';
    const role: Role = (['STUDENT', 'SUPERVISOR', 'ADMIN'].includes(meta.role) ? meta.role : 'STUDENT') as Role;

    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name, role, email: sbUser.email }),
    });

    // 409 = profile already exists (race), treat as success
    if (!res.ok && res.status !== 409) return null;

    return fetchLocalProfile(accessToken);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        const profile = await fetchLocalProfile(session.access_token);
        setUser(profile);
      }
      setHydrated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.access_token) {
        const profile = await fetchLocalProfile(session.access_token);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    // Auto-create local profile if missing (handles email-confirmation flow gap)
    const profile = await ensureLocalProfile(data.session.access_token);
    if (!profile) throw new Error('Unable to load your profile. Please contact an administrator.');
    setUser(profile);
  };

  const register = async (email: string, password: string, name: string, role: Role) => {
    // Store name + role in Supabase user_metadata so auto-create works after email confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw new Error(error.message);

    if (!data.session) {
      // Email confirmation required — profile will be auto-created on first login
      throw new Error('CHECK_EMAIL');
    }

    // Immediate session (no email confirmation) — create profile now
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({ name, role, email }),
    });

    if (!res.ok && res.status !== 409) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to create profile');
    }

    const profile = await fetchLocalProfile(data.session.access_token);
    setUser(profile);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/login';
  };

  const getAccessToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  return (
    <AuthContext.Provider value={{ user, session, hydrated, login, register, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
