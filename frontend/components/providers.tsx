"use client";
import React from 'react';
import { AuthProvider } from './auth/auth-context';
import { SidebarProvider } from './ui/SidebarContext';
import { SettingsProvider } from '../contexts/SettingsContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
