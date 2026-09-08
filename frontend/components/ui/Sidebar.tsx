"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth/auth-context';
import { useSidebar } from './SidebarContext';
import { useSettings } from '../../contexts/SettingsContext';
import { navItems, exactHrefs, roleGradients } from './navConfig';

// ── Component ──────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user } = useAuth();
  const { open, toggle, close } = useSidebar();
  const { persistentSidebar, resolvedTheme } = useSettings();
  const pathname = usePathname();
  const isDark = resolvedTheme === 'dark';
  const [edgeHovered, setEdgeHovered] = React.useState(false);
  const [edgeY, setEdgeY] = React.useState(0);

  if (!user) return null;

  const role = user.role as keyof typeof navItems;
  const items = navItems[role] ?? navItems.STUDENT;
  const gradient = roleGradients[role] ?? roleGradients.STUDENT;
  const initial = (user.name ?? user.email ?? '?').charAt(0).toUpperCase();

  return (
    <>
      {/* Left-edge hover strip — tablet/desktop only, touch devices use bottom nav */}
      {!persistentSidebar && !open && (
        <div
          className="hidden md:block fixed left-0 top-0 z-30 h-full w-4 cursor-pointer"
          onMouseEnter={() => setEdgeHovered(true)}
          onMouseLeave={() => setEdgeHovered(false)}
          onMouseMove={(e) => setEdgeY(Math.min(Math.max(e.clientY, 28), window.innerHeight - 28))}
          onClick={toggle}
        >
          {/* Arrow tab — follows cursor Y, slides in on hover */}
          <div
            className="pointer-events-none absolute left-0 flex items-center transition-all duration-200 ease-out"
            style={{
              top: edgeY - 22,
              opacity: edgeHovered ? 1 : 0,
              transform: edgeHovered ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            <div
              className="flex h-11 w-6 items-center justify-center rounded-r-xl shadow-lg"
              style={isDark ? {
                background: '#252d40',
                border: '1px solid rgba(255,255,255,0.10)',
                borderLeft: 'none',
              } : {
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(148,163,184,0.35)',
                borderLeft: 'none',
                boxShadow: '2px 0 12px rgba(15,23,42,0.10)',
              }}
            >
              <svg className={`h-3.5 w-3.5 ${isDark ? 'text-slate-300' : 'text-slate-500'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay — hidden on desktop only when sidebar is persistent */}
      <div
        onClick={close}
        className={[
          persistentSidebar ? 'lg:hidden' : '',
          'fixed inset-0 z-40',
          'bg-slate-900/50 backdrop-blur-sm',
          'transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Sidebar panel */}
      <aside
        className={[
          'glass-sidebar',
          'fixed top-0 left-0 z-50 h-full w-[260px]',
          'flex flex-col overflow-y-auto',
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-x-0' : '-translate-x-full',
          persistentSidebar ? 'lg:translate-x-0' : '',
        ].join(' ')}
      >
        {/* ── Brand ── */}
        <div className="px-3 pt-5 pb-2">
          <div className={`relative overflow-hidden rounded-2xl ${isDark ? 'bg-transparent' : 'bg-white'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isDark ? "/logo-dark.png" : "/logo-inapp.png"}
              alt="IPMS"
              className="block w-full h-auto"
            />
            {/* Close — hidden on desktop only when sidebar is persistent */}
            <button
              onClick={close}
              className={`${persistentSidebar ? 'lg:hidden' : ''} absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white/70 hover:bg-black/30 hover:text-white transition`}
              aria-label="Close menu"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── User profile pill ── */}
        <div
          className="mx-3 mb-5 rounded-2xl p-3"
          style={isDark ? {
            background: '#252d40',
            border: '1px solid rgba(255,255,255,0.09)',
          } : {
            background: 'rgba(255,255,255,0.58)',
            border: '1px solid rgba(255,255,255,0.72)',
            boxShadow: '0 2px 8px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,0.85)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm ring-2 ring-white/50`}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-slate-900 leading-tight">
                {user.name || user.email}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mt-0.5">
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 space-y-0.5 px-3">
          <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400/80">
            Menu
          </div>
          {items.map((it) => {
            const active = exactHrefs.has(it.href)
              ? pathname === it.href
              : pathname.startsWith(it.href);

            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={close}
                className={[
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium',
                  'transition-all duration-150',
                  active
                    ? isDark ? 'text-sky-400' : 'text-sky-700'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                      : 'text-slate-600 hover:text-slate-900',
                ].join(' ')}
                style={active ? (isDark ? {
                  background: 'rgba(14,165,233,0.12)',
                  borderLeft: '2px solid rgba(14,165,233,0.70)',
                  paddingLeft: '10px',
                } : {
                  background: 'rgba(255,255,255,0.78)',
                  boxShadow:
                    '0 2px 10px rgba(14,165,233,0.10), ' +
                    '0 1px 0 rgba(255,255,255,0.9) inset, ' +
                    '0 0 0 1px rgba(14,165,233,0.18)',
                }) : undefined}
              >
                <span
                  className={[
                    'flex-shrink-0 transition-colors',
                    active
                      ? isDark ? 'text-sky-400' : 'text-sky-500'
                      : isDark
                        ? 'text-slate-500 group-hover:text-slate-300'
                        : 'text-slate-400 group-hover:text-slate-500',
                  ].join(' ')}
                >
                  {it.icon}
                </span>
                <span className="flex-1">{it.label}</span>
                {active && (
                  <span className={`h-1.5 w-1.5 rounded-full ${isDark ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]' : 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]'}`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer tip ── */}
        <div
          className="m-3 mt-5 rounded-2xl p-4"
          style={isDark ? {
            background: '#0d1117',
            border: '1px solid rgba(255,255,255,0.08)',
          } : {
            background: 'rgba(255,255,255,0.45)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-sky-900/40 text-sky-400' : 'bg-sky-100 text-sky-600'}`}>
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </span>
            <p className="text-[11.5px] leading-relaxed text-slate-500">
              Check your health score daily to stay ahead of deadlines.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
