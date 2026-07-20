"use client";
import React from 'react';
import { useAuth } from '../../../components/auth/auth-context';
import DiscussionsLayout from '../../../components/discussions/DiscussionsLayout';

export default function SupervisorDiscussionsPage() {
  const { user } = useAuth();
  if (!user) return null;

  const name = [user.name].filter(Boolean).join(' ') || user.email || 'Supervisor';

  return <DiscussionsLayout userId={user.id} userName={name} role={user.role as string} />;
}
