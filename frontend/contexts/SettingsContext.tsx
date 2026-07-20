"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

type SettingsCtx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  persistentSidebar: boolean;
  setPersistentSidebar: (v: boolean) => void;
  compact: boolean;
  setCompact: (v: boolean) => void;
  resolvedTheme: 'light' | 'dark';
};

const Ctx = createContext<SettingsCtx | undefined>(undefined);

function getResolved(theme: Theme): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(theme: Theme): 'light' | 'dark' {
  const r = getResolved(theme);
  document.documentElement.classList.toggle('dark', r === 'dark');
  return r;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, _setTheme] = useState<Theme>('light');
  const [persistentSidebar, _setPersistent] = useState(true);
  const [compact, _setCompact] = useState(false);
  const [resolvedTheme, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const t = (localStorage.getItem('ipms_theme') as Theme) || 'light';
    const p = localStorage.getItem('ipms_persistent_sidebar') !== 'false';
    const c = localStorage.getItem('ipms_compact') === 'true';
    _setTheme(t);
    _setPersistent(p);
    _setCompact(c);
    setResolved(applyTheme(t));
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolved(applyTheme('system'));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    _setTheme(t);
    localStorage.setItem('ipms_theme', t);
    setResolved(applyTheme(t));
  }, []);

  const setPersistentSidebar = useCallback((v: boolean) => {
    _setPersistent(v);
    localStorage.setItem('ipms_persistent_sidebar', String(v));
  }, []);

  const setCompact = useCallback((v: boolean) => {
    _setCompact(v);
    localStorage.setItem('ipms_compact', String(v));
  }, []);

  return (
    <Ctx.Provider value={{ theme, setTheme, persistentSidebar, setPersistentSidebar, compact, setCompact, resolvedTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSettings must be within SettingsProvider');
  return c;
}
