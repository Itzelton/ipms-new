"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';
const LOCAL_TOKEN_KEY = 'ipms_local_token';

function extractMessage(err: any): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  const msg = err?.message ?? err?.error_description ?? err?.error ?? '';
  if (Array.isArray(msg)) return msg[0] ?? '';
  if (typeof msg === 'object') return JSON.stringify(msg);
  return String(msg);
}

export type Role = 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | null;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword?: boolean;
};

type AuthContextType = {
  user: SessionUser | null;
  session: Session | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function fetchLocalProfile(accessToken: string): Promise<SessionUser | null> {
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
  return { id: u.id, email: u.email, name: u.preferredName || u.firstName || u.email, role, mustChangePassword: u.mustChangePassword ?? false };
}

async function ensureLocalProfile(accessToken: string): Promise<SessionUser> {
  let sbUserCache: any = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const existing = await fetchLocalProfile(accessToken);
      if (existing) return existing;
    } catch {
      // network error or server not ready — retry below
    }

    if (attempt === 0) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser(accessToken);
        sbUserCache = sbUser;
        if (sbUser) {
          const meta = sbUser.user_metadata ?? {};
          const name = meta.name || sbUser.email?.split('@')[0] || 'User';
          const role: Role = (['STUDENT', 'SUPERVISOR', 'ADMIN'].includes(meta.role) ? meta.role : 'STUDENT') as Role;

          const registerRes = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ name, role, email: sbUser.email }),
          });

          // 409 = already exists, anything else = wait and retry
          if (!registerRes.ok && registerRes.status !== 409) {
            await delay(4000);
          }
        }
      } catch {
        await delay(4000);
      }
    }
  }

  // Final fallback: build a minimal user from the Supabase JWT claims so login
  // still works when Railway is temporarily unreachable.
  const sbUser = sbUserCache ?? (await supabase.auth.getUser(accessToken).then(r => r.data.user).catch(() => null));
  if (sbUser?.email) {
    const meta = sbUser.user_metadata ?? {};
    const name = meta.name || sbUser.email.split('@')[0] || 'User';
    const role: Role = (['STUDENT', 'SUPERVISOR', 'ADMIN'].includes(meta.role) ? meta.role : 'STUDENT') as Role;
    return { id: sbUser.id, email: sbUser.email, name, role, mustChangePassword: false };
  }

  throw new Error('Could not reach the server. Please try again in a moment.');
}

function unwrapResponse(json: any) {
  // Backend wraps all success responses as { data: ..., timestamp: ... }
  return json?.data !== undefined ? json.data : json;
}

async function localAuthPost(path: string, body: object, fallbackError: string): Promise<{ access_token: string; user: SessionUser }> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = Array.isArray(json?.message) ? json.message[0] : (json?.message || fallbackError);
    throw new Error(msg);
  }

  const payload = unwrapResponse(json);
  const { access_token, user } = payload;

  if (!access_token || !user) {
    throw new Error(fallbackError);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_TOKEN_KEY, access_token);
  }

  return { access_token, user: user as SessionUser };
}

async function tryLocalLogin(email: string, password: string): Promise<SessionUser> {
  const { user } = await localAuthPost('/auth/local-login', { email, password }, 'Invalid credentials');
  return user;
}

async function tryLocalRegister(email: string, password: string, name: string, role: Role): Promise<SessionUser> {
  const { user } = await localAuthPost('/auth/local-register', { email, password, name, role }, 'Unable to create account');
  return user;
}

function shouldFallbackToLocal(err: any): boolean {
  const msg: string = extractMessage(err).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('load failed') ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid_credentials') ||
    msg.includes('email not confirmed') ||
    msg.includes('email_not_confirmed')
  );
}


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        try {
          const profile = await fetchLocalProfile(session.access_token);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else if (typeof window !== 'undefined') {
        // Restore from local dev token
        const localToken = localStorage.getItem(LOCAL_TOKEN_KEY);
        if (localToken) {
          const profile = await fetchLocalProfile(localToken);
          if (profile) {
            setUser(profile);
          } else {
            localStorage.removeItem(LOCAL_TOKEN_KEY);
          }
        }
      }
      setHydrated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.access_token) {
        try {
          const profile = await fetchLocalProfile(session.access_token);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const profile = await ensureLocalProfile(data.session.access_token);
      setUser(profile);
    } catch (err: any) {
      if (shouldFallbackToLocal(err)) {
        const profile = await tryLocalLogin(email, password);
        setUser(profile);
        return;
      }
      throw new Error(extractMessage(err) || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string, role: Role) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });

      if (error) throw error;

      if (!data.session) {
        throw new Error('CHECK_EMAIL');
      }

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
        const msg = Array.isArray(body?.message) ? body.message[0] : (body?.message || 'Failed to create profile');
        throw new Error(msg);
      }

      const profile = await fetchLocalProfile(data.session.access_token);
      setUser(profile);
    } catch (err: any) {
      if (err?.message === 'CHECK_EMAIL') throw err;
      // Supabase failed (rate limit, network, etc.) — always fall back to local registration
      try {
        const profile = await tryLocalRegister(email, password, name, role);
        setUser(profile);
        return;
      } catch (localErr: any) {
        throw new Error(extractMessage(localErr) || 'Unable to create account');
      }
    }
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore supabase errors on logout */ }
    if (typeof window !== 'undefined') localStorage.removeItem(LOCAL_TOKEN_KEY);
    setUser(null);
    setSession(null);
    window.location.href = '/login';
  };

  const getAccessToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
    if (typeof window !== 'undefined') return localStorage.getItem(LOCAL_TOKEN_KEY);
    return null;
  };

  const refreshUser = async () => {
    const token = await getAccessToken();
    if (!token) return;
    const profile = await fetchLocalProfile(token);
    if (profile) setUser(profile);
  };

  return (
    <AuthContext.Provider value={{ user, session, hydrated, login, register, logout, getAccessToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
