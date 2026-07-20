"use client";
import React from 'react';

const statusStyle: Record<string, { dot: string; badge: string; label: string }> = {
  COMPLETED: { dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700', label: 'Done' },
  PENDING:   { dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700',     label: 'Pending' },
  OVERDUE:   { dot: 'bg-rose-400',    badge: 'bg-rose-100 text-rose-700',       label: 'Overdue' },
};

function fmtDate(d: string) {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(d));
  } catch { return d; }
}

export default function MilestonesList({ milestones }: { milestones?: any[] }) {
  if (!milestones || milestones.length === 0) return (
    <div className="card p-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No milestones yet</p>
      </div>
    </div>
  );

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Milestones</p>
          <p className="text-sm font-semibold text-slate-900">
            {milestones.filter(m => m.status === 'COMPLETED').length}/{milestones.length} complete
          </p>
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {milestones.map((m) => {
          const s = statusStyle[m.status] ?? statusStyle.PENDING;
          return (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-800">{m.title}</p>
                  <p className="text-[11px] text-slate-400">Due {fmtDate(m.dueDate)}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
