"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/auth-context';
import { useSidebar } from './SidebarContext';
import { apiGet, apiPatch } from '../../services/api';

const roleGradients: Record<string, string> = {
  ADMIN:      'from-rose-500 to-orange-500',
  SUPERVISOR: 'from-violet-500 to-indigo-600',
  STUDENT:    'from-sky-500 to-blue-600',
};

function fmtTime(d: string) {
  if (!d) return '';
  try {
    const date = new Date(d);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
  } catch { return ''; }
}

export default function Navbar({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [bellClicked, setBellClicked] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function applyList(list: any[]) {
    setNotifications(list.slice(0, 20));
    setUnread(list.filter((n: any) => !n.read).length);
  }

  // Fetch on mount, then poll every 30 s for new notifications
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    function fetchNotifs() {
      apiGet('/notifications')
        .then((list: any) => {
          if (mounted && Array.isArray(list)) applyList(list);
        })
        .catch(() => {})
        .finally(() => { if (mounted) setInitialLoad(false); });
    }
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, [user]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Toggle dropdown only — do NOT auto-mark anything read here
  function handleBellClick() {
    setOpen((prev) => !prev);
    setBellClicked(true);
    setTimeout(() => setBellClicked(false), 560);
  }

  // Click a notification: mark it read, navigate if it has a link
  function handleNotifClick(n: any) {
    if (!n.read) {
      apiPatch(`/notifications/${n.id}`, { read: true }).catch(() => {});
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnread((prev) => Math.max(0, prev - 1));
    }
    if (n.link) {
      setOpen(false);
      window.location.href = n.link;
    }
    // No link → just mark read, keep dropdown open so user can read others
  }

  // Mark all as read — only updates state after API confirms
  async function handleMarkAllRead() {
    try {
      await apiPatch('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch { /* network error — leave state unchanged */ }
  }

  const gradient = user?.role ? (roleGradients[user.role] ?? roleGradients.STUDENT) : roleGradients.STUDENT;
  const initial = user ? (user.name ?? user.email ?? '?').charAt(0).toUpperCase() : '?';
  const hasNotifications = notifications.length > 0;

  return (
    <header className="glass-nav sticky top-0 z-20 w-full">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5">

        {/* Left — hamburger + logo on mobile */}
        <div className="flex items-center gap-2.5">
          {user && (
            <button
              onClick={toggle}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-white/60 transition"
              aria-label="Open sidebar"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href="/" className="lg:hidden flex items-center gap-2 no-underline">
            <img
              src="/logo-icon.png"
              alt="IPMS"
              className="h-8 w-8 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <span className="text-[15px] font-bold tracking-tight text-slate-900">IPMS</span>
          </Link>
        </div>

        {/* Right — search + notification bell + user chip + logout */}
        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              {/* Search trigger */}
              <button
                onClick={onSearchOpen}
                className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-1.5 text-[12px] text-slate-400 hover:bg-white/80 hover:text-slate-600 transition"
                aria-label="Search"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <span>Search</span>
                <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-medium text-slate-400">⌘K</kbd>
              </button>
              {/* Mobile search icon-only */}
              <button
                onClick={onSearchOpen}
                className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-white/60 transition"
                aria-label="Search"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </button>

              <div className="relative" ref={wrapperRef}>
                {/* Bell button */}
                <button
                  onClick={handleBellClick}
                  aria-label="Notifications"
                  aria-expanded={open}
                  className={[
                    'relative flex h-9 w-9 items-center justify-center rounded-xl transition',
                    open
                      ? 'bg-sky-50 text-sky-600 ring-1 ring-sky-200/80'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-700',
                    bellClicked
                      ? 'animate-bell-click'
                      : (unread > 0 && !open)
                        ? 'animate-bell-ring'
                        : '',
                  ].join(' ')}
                >
                  <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold text-white leading-none">
                      {unread}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {open && (
                  <div
                    className="animate-dropdown-in absolute right-0 top-full mt-2 w-[340px] overflow-hidden rounded-2xl z-50"
                    style={{
                      background: 'rgba(255,255,255,0.97)',
                      backdropFilter: 'blur(28px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                      border: '1px solid rgba(226,232,240,0.80)',
                      boxShadow: '0 8px 40px rgba(15,23,42,0.14), 0 1px 0 rgba(255,255,255,0.90) inset',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-slate-800">Notifications</span>
                        {unread > 0 && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 leading-none">
                            {unread} unread
                          </span>
                        )}
                      </div>
                      {unread > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-medium text-sky-600 hover:text-sky-700 transition"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Body */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {initialLoad ? (
                        <div className="py-2">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="flex items-start gap-3 px-4 py-3">
                              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-slate-100 animate-pulse" />
                              <div className="flex-1 space-y-2">
                                <div className="h-3 w-2/3 rounded-md bg-slate-100 animate-pulse" />
                                <div className="h-2.5 w-1/2 rounded-md bg-slate-100 animate-pulse" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : !hasNotifications ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                            <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-[13px] font-medium text-slate-600">You're all caught up</p>
                          <p className="text-[11px] text-slate-400">No notifications yet</p>
                        </div>
                      ) : (
                        <ul>
                          {notifications.map((n, i) => (
                            <li
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className={[
                                'group cursor-pointer px-4 py-3 transition-colors',
                                i < notifications.length - 1 ? 'border-b border-slate-50' : '',
                                n.read
                                  ? 'hover:bg-slate-50'
                                  : 'bg-sky-50/70 hover:bg-sky-50',
                              ].join(' ')}
                            >
                              <div className="flex items-start gap-3">
                                {/* Unread indicator dot */}
                                <div className="mt-[5px] flex-shrink-0">
                                  <span className={[
                                    'block h-2 w-2 rounded-full transition-colors',
                                    n.read ? 'bg-slate-200' : 'bg-sky-500',
                                  ].join(' ')} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={[
                                      'text-[13px] leading-snug',
                                      n.read ? 'font-normal text-slate-500' : 'font-semibold text-slate-900',
                                    ].join(' ')}>
                                      {n.title}
                                    </p>
                                    <span className="flex-shrink-0 text-[10px] text-slate-400 leading-5">
                                      {fmtTime(n.createdAt)}
                                    </span>
                                  </div>

                                  {n.message && (
                                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
                                      {n.message}
                                    </p>
                                  )}

                                  {n.link && (
                                    <p className={[
                                      'mt-1 text-[11px] font-medium transition-colors',
                                      n.read ? 'text-slate-400 group-hover:text-sky-500' : 'text-sky-500',
                                    ].join(' ')}>
                                      View →
                                    </p>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User chip */}
              <div
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] font-medium text-slate-700"
                style={{
                  background: 'rgba(255,255,255,0.60)',
                  border: '1px solid rgba(255,255,255,0.72)',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
                }}
              >
                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-bold text-white shadow-sm`}>
                  {initial}
                </div>
                <span className="hidden sm:inline max-w-[140px] truncate leading-tight">
                  {user.name || user.email}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={() => logout()}
                className="rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-white/60 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-xl bg-white/60 px-3 py-2 text-[13px] font-medium text-slate-800 hover:bg-white/80 transition no-underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
