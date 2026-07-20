"use client";
import React from 'react';
import AppShell from '../../components/ui/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
