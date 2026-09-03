"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/auth-context';

function fmtDate(d: string) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(d)); }
  catch { return d; }
}

export default function ProjectDiscussionsPanel({ discussions }: { discussions?: any[] }) {
  const { user } = useAuth();
  const discussionsHref = user?.role === 'SUPERVISOR' ? '/supervisor/discussions' : '/student/discussions';

  if (!discussions || discussions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">No discussion threads yet.</p>
        <Link href={discussionsHref} className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-sky-600 hover:text-sky-700 no-underline">
          Go to Discussions →
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Discussion Threads</p>
        <Link href={discussionsHref} className="text-[11px] font-medium text-sky-600 hover:text-sky-700 no-underline">
          Open Discussions →
        </Link>
      </div>
      <ul className="divide-y divide-slate-100">
        {discussions.map((thread) => (
          <li key={thread.id} className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100">
                <svg className="h-4 w-4 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-slate-800">{thread.title}</p>
                <p className="text-[11px] text-slate-400">Updated {fmtDate(thread.updatedAt)} · {thread.messages ?? 0} messages</p>
              </div>
            </div>
            <Link
              href={discussionsHref}
              className="flex-shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-700 transition-colors no-underline"
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
