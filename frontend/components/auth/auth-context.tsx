"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | null;

type User = { id: string; email: string; role: Role } | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('ipms_user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = async (email: string, password: string) => {
    // Placeholder: in real app call /api/v1/auth/login
    const fake = { id: 'user-1', email, role: (email.includes('admin') ? 'ADMIN' : email.includes('sup') ? 'SUPERVISOR' : 'STUDENT') as Role } as User;

    setUser(fake);
    localStorage.setItem('ipms_user', JSON.stringify(fake));

    // redirect based on role
    const role = fake?.role;

    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'SUPERVISOR') router.push('/supervisor');
    else router.push('/student');

  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ipms_user');
    router.push('/login');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
