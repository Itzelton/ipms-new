"use client";
import React, { useEffect } from 'react';
import { AuthProvider } from './auth/auth-context';
import { SidebarProvider } from './ui/SidebarContext';
import { SettingsProvider } from '../contexts/SettingsContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

// Ping the backend every 9 minutes to prevent Render free-tier cold starts.
// The health endpoint at GET / requires no auth and returns instantly.
function KeepAlive() {
  useEffect(() => {
    const ping = () => fetch(`${API_BASE}/`, { method: 'GET' }).catch(() => {});
    ping(); // warm up immediately on first load
    const id = setInterval(ping, 9 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <SidebarProvider>
          <KeepAlive />
          {children}
        </SidebarProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
