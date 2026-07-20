"use client";
import React from 'react';

function fmtTime(d: string) {
  if (!d) return '';
  try {
    const date = new Date(d);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
  } catch { return ''; }
}

export default function NotificationsPanel({ notifications }: { notifications?: any[] }) {
  const isEmpty = !notifications || notifications.length === 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 shadow-sm">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Notifications</p>
        </div>
        {!isEmpty && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
            {notifications!.length}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-slate-500">All caught up</p>
          <p className="text-[11px] text-slate-400">No new notifications</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {notifications!.map((n) => (
            <li
              key={n.id}
              className="group rounded-xl px-3 py-3 transition-colors hover:bg-slate-50/80"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-medium text-slate-800 leading-snug">{n.title}</p>
                    <span className="flex-shrink-0 text-[11px] text-slate-400">{fmtTime(n.createdAt)}</span>
                  </div>
                  {n.message && (
                    <p className="mt-0.5 text-[12px] text-slate-500 line-clamp-2">{n.message}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
