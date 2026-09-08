"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
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
          <main className={`max-w-[1400px] ${compact ? 'p-2 sm:p-4' : 'p-3 sm:p-6'}`}>
            {children}
            {/* Spacer so content isn't hidden behind the mobile bottom nav */}
            <div
              className="md:hidden"
              style={{ height: 'calc(60px + env(safe-area-inset-bottom))' }}
            />
          </main>
        </div>
      </div>
      <BottomNav />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
