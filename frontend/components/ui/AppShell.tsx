"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import SearchPalette from './SearchPalette';
import { useSettings } from '../../contexts/SettingsContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { persistentSidebar, compact } = useSettings();
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div
        className="flex-1 transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: persistentSidebar ? undefined : 0 }}
      >
        <div className={persistentSidebar ? 'lg:ml-[260px]' : ''}>
          <Navbar onSearchOpen={() => setSearchOpen(true)} />
          <main className={`max-w-[1400px] ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>{children}</main>
        </div>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
