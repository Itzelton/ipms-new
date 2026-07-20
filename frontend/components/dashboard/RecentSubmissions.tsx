"use client";
import React from 'react';

const statusStyle: Record<string, string> = {
  SUBMITTED:    'bg-sky-100 text-sky-700',
  UNDER_REVIEW: 'bg-violet-100 text-violet-700',
  APPROVED:     'bg-emerald-100 text-emerald-700',
  REJECTED:     'bg-rose-100 text-rose-700',
  REVISION:     'bg-amber-100 text-amber-700',
};

function fmtDate(d: string) {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
  } catch { return d; }
}

export default function RecentSubmissions({ submissions }: { submissions?: any[] }) {
  if (!submissions || submissions.length === 0) return (
    <div className="card p-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No submissions yet</p>
        <p className="mt-1 text-xs text-slate-400">Your uploaded submissions will appear here</p>
      </div>
    </div>
  );

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-sm">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Recent Submissions</p>
      </div>

      <ul className="divide-y divide-slate-100">
        {submissions.map((s) => {
          const badge = statusStyle[s.status] ?? 'bg-slate-100 text-slate-600';
          const label = (s.status ?? '').replace(/_/g, ' ');
          return (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <svg className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-800">{s.title}</p>
                  <p className="text-[11px] text-slate-400">{fmtDate(s.submittedAt)}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${badge}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
