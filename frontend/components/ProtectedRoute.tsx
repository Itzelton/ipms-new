"use client";
import React, { useEffect } from 'react';
import { useAuth } from './auth/auth-context';

export default function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return; // Don't redirect until we know auth state

    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (roles && !roles.includes(user.role || '')) {
      const path = user.role === 'ADMIN' ? '/admin' : user.role === 'SUPERVISOR' ? '/supervisor' : '/student';
      window.location.href = path;
    }
  }, [user, hydrated, roles]);

  // Don't render anything until hydrated
  if (!hydrated) return null;

  // Don't render if not authenticated
  if (!user) return null;

  // Don't render if wrong role (redirect is in-flight)
  if (roles && !roles.includes(user.role || '')) return null;

  return <>{children}</>;
}
