"use client";
import React from 'react';
import { AuthProvider } from './auth/auth-context';
import { SidebarProvider } from './ui/SidebarContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthProvider>
  );
}
