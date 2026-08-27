import React from 'react';
import AppShell from '../../components/ui/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["STUDENT"]}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
