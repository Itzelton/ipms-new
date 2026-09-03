"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth/auth-context';
import { useSidebar } from './SidebarContext';
import { useSettings } from '../../contexts/SettingsContext';

// ── Icons ──────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const FolderIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ChatIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BotIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const AuditIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CogIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const GridIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinejoin="round" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinejoin="round" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinejoin="round" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinejoin="round" />
  </svg>
);

// ── Nav definitions ────────────────────────────────────────────────────────

const navItems: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { href: '/admin',                label: 'Dashboard',    icon: <GridIcon /> },
    { href: '/admin/users',          label: 'Users',        icon: <UsersIcon /> },
    { href: '/admin/students',       label: 'Students',     icon: <UsersIcon /> },
    { href: '/admin/supervisors',    label: 'Supervisors',  icon: <ChartIcon /> },
    { href: '/admin/assignments',    label: 'Assignments',  icon: <ClipboardIcon /> },
    { href: '/admin/projects',       label: 'Projects',     icon: <FolderIcon /> },
    { href: '/admin/reports',        label: 'Reports',      icon: <ChartIcon /> },
    { href: '/admin/bulk-upload',    label: 'Bulk Upload',  icon: <UploadCloudIcon /> },
    { href: '/admin/approvals',      label: 'Approvals',    icon: <CheckCircleIcon /> },
    { href: '/admin/audit',          label: 'Audit Trail',  icon: <AuditIcon /> },
    { href: '/admin/settings',       label: 'Settings',     icon: <CogIcon /> },
  ],
  SUPERVISOR: [
    { href: '/supervisor',              label: 'Dashboard',    icon: <HomeIcon /> },
    { href: '/supervisor/projects',     label: 'Projects',     icon: <FolderIcon /> },
    { href: '/supervisor/reviews',      label: 'Reviews',      icon: <ClipboardIcon /> },
    { href: '/supervisor/meetings',     label: 'Meetings',     icon: <CalendarIcon /> },
    { href: '/supervisor/messages',     label: 'Messages',     icon: <MessageIcon /> },
    { href: '/supervisor/discussions',  label: 'Discussions',  icon: <ChatIcon /> },
    { href: '/supervisor/settings',     label: 'Settings',     icon: <CogIcon /> },
  ],
  STUDENT: [
    { href: '/student',               label: 'Dashboard',    icon: <HomeIcon /> },
    { href: '/student/projects',      label: 'Projects',     icon: <FolderIcon /> },
    { href: '/student/submissions',   label: 'Submissions',  icon: <UploadIcon /> },
    { href: '/student/meetings',      label: 'Meetings',     icon: <CalendarIcon /> },
    { href: '/student/messages',      label: 'Messages',     icon: <MessageIcon /> },
    { href: '/student/discussions',   label: 'Discussions',  icon: <ChatIcon /> },
    { href: '/student/settings',      label: 'Settings',     icon: <CogIcon /> },
  ],
};

const roleGradients: Record<string, string> = {
  ADMIN:      'from-rose-500 to-orange-500',
  SUPERVISOR: 'from-violet-500 to-indigo-600',
  STUDENT:    'from-sky-500 to-blue-600',
};

// root hrefs that should be exact-match only (not startsWith)
const exactHrefs = new Set(['/admin', '/supervisor', '/student']);

// ── Component ──────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user } = useAuth();
  const { open, close } = useSidebar();
  const { persistentSidebar, resolvedTheme } = useSettings();
  const pathname = usePathname();
  const isDark = resolvedTheme === 'dark';

  if (!user) return null;

  const role = user.role as keyof typeof navItems;
  const items = navItems[role] ?? navItems.STUDENT;
  const gradient = roleGradients[role] ?? roleGradients.STUDENT;
  const initial = (user.name ?? user.email ?? '?').charAt(0).toUpperCase();

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      <div
        onClick={close}
        className={[
          'lg:hidden fixed inset-0 z-40',
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
            {/* Close — mobile only */}
            <button
              onClick={close}
              className="lg:hidden absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white/70 hover:bg-black/30 hover:text-white transition"
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
