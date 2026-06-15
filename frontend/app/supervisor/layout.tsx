"use client";
import React from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Navbar from '../../components/ui/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["SUPERVISOR"]}>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
