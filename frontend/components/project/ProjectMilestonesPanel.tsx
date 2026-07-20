"use client";
import React from 'react';

const statusStyle: Record<string, { badge: string; dot: string }> = {
  COMPLETED:   { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  IN_PROGRESS: { badge: 'bg-sky-100 text-sky-700',         dot: 'bg-sky-400' },
  PENDING:     { badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400' },
  OVERDUE:     { badge: 'bg-rose-100 text-rose-700',       dot: 'bg-rose-400' },
};

function fmtDate(d: string) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

export default function ProjectMilestonesPanel({ milestones }: { milestones?: any[] }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">No milestones defined for this project.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Milestones</p>
        <span className="text-[11px] text-slate-400">{milestones.length} items</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {milestones.map((m) => {
          const s = statusStyle[m.status] ?? statusStyle.PENDING;
          return (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-800">{m.title}</p>
                  <p className="text-[11px] text-slate-400">Due {fmtDate(m.dueDate)}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                {(m.status ?? '').replace(/_/g, ' ')}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
