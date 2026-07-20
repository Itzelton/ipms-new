"use client";
import React from 'react';

const statusStyle: Record<string, string> = {
  APPROVED:          'bg-emerald-100 text-emerald-700',
  UNDER_REVIEW:      'bg-amber-100 text-amber-700',
  REVISION_REQUIRED: 'bg-rose-100 text-rose-700',
  SUBMITTED:         'bg-sky-100 text-sky-700',
};

function fmtDate(d: string) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

export default function ProjectSubmissionsPanel({ submissions }: { submissions?: any[] }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">No submissions have been made yet.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Submissions</p>
        <span className="text-[11px] text-slate-400">{submissions.length} recent</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {submissions.map((s) => {
          const badge = statusStyle[s.status] ?? 'bg-slate-100 text-slate-600';
          return (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-800">{s.title || 'Untitled submission'}</p>
                  <p className="text-[11px] text-slate-400">Submitted {fmtDate(s.submittedAt)}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                {(s.status ?? '').replace(/_/g, ' ')}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
