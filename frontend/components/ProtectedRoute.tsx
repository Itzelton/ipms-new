"use client";
import React, { useEffect } from 'react';
import { useAuth } from './auth/auth-context';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (roles && user && !roles.includes(user.role || '')) {
      // redirect to role root
      if (user.role === 'ADMIN') router.replace('/admin');
      else if (user.role === 'SUPERVISOR') router.replace('/supervisor');
      else router.replace('/student');
    }
  }, [user, router, roles]);

  if (!user) return null;
  if (roles && user && !roles.includes(user.role || '')) return null;

  return <>{children}</>;
}
