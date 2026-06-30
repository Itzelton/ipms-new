"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth/auth-context';
import { useSidebar } from './SidebarContext';

const navItems: Record<string, { href: string; label: string }[]> = {
  ADMIN: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/settings', label: 'Settings' },
  ],
  SUPERVISOR: [
    { href: '/supervisor', label: 'Dashboard' },
    { href: '/supervisor/projects', label: 'Projects' },
    { href: '/supervisor/reviews', label: 'Reviews' },
    { href: '/supervisor/discussions', label: 'Discussions' },
    { href: '/supervisor/settings', label: 'Settings' },
  ],
  STUDENT: [
    { href: '/student', label: 'Dashboard' },
    { href: '/student/projects', label: 'Projects' },
    { href: '/student/submissions', label: 'Submissions' },
    { href: '/student/discussions', label: 'Discussions' },
    { href: '/student/settings', label: 'Settings' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const { open, close } = useSidebar();
  const pathname = usePathname();

  if (!user) return null;

  const role = user.role as keyof typeof navItems;
  const items = navItems[role] ?? navItems.STUDENT;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
          transition: 'opacity 0.3s ease',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          height: '100%',
          width: '288px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '24px 20px',
          background: 'white',
          borderRight: '1px solid rgba(226,232,240,0.8)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          style={{ position: 'absolute', top: '20px', right: '16px' }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="space-y-4">
          <div className="rounded-3xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 ring-1 ring-sky-100">
            Welcome back,
            <div className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-[0.18em]">{role ?? 'guest'}</div>
          </div>

          <nav className="space-y-2">
            {items.map((it) => {
              const active = pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href));
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={close}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    active ? 'bg-sky-100 text-sky-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ marginTop: 'auto' }} className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 shadow-sm">
          Quick tip: use your dashboard cards to track progress, not paperwork.
        </div>
      </aside>
    </>
  );
}
