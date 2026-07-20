"use client";
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSettings } from '../../contexts/SettingsContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { persistentSidebar, compact } = useSettings();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div
        className="flex-1 transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: persistentSidebar ? undefined : 0 }}
      >
        <div className={persistentSidebar ? 'lg:ml-[260px]' : ''}>
          <Navbar />
          <main className={`max-w-[1400px] ${compact ? 'p-4' : 'p-6'}`}>{children}</main>
        </div>
      </div>
    </div>
  );
}
