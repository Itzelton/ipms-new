"use client";
import React from 'react';
import AppShell from '../../components/ui/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["SUPERVISOR"]}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
