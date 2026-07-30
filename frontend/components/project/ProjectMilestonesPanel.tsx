"use client";
import React, { useState } from 'react';

const COLUMNS = [
  { key: 'PENDING',     label: 'To Do',       dot: 'bg-amber-400',   card: 'border-amber-200 bg-amber-50/40' },
  { key: 'IN_PROGRESS', label: 'In Progress',  dot: 'bg-sky-400',     card: 'border-sky-200 bg-sky-50/40' },
  { key: 'COMPLETED',   label: 'Done',         dot: 'bg-emerald-400', card: 'border-emerald-200 bg-emerald-50/40' },
  { key: 'OVERDUE',     label: 'Overdue',      dot: 'bg-rose-400',    card: 'border-rose-200 bg-rose-50/40' },
];

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

type View = 'list' | 'board';

export default function ProjectMilestonesPanel({ milestones }: { milestones?: any[] }) {
  const [view, setView] = useState<View>('list');

  if (!milestones || milestones.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No milestones defined yet</p>
        <p className="mt-1 text-xs text-slate-400">Your supervisor will add milestones for this project.</p>
      </div>
    );
  }

  const done = milestones.filter((m) => m.status === 'COMPLETED').length;

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Milestones</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{done}/{milestones.length} complete</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setView('list')}
            title="List view"
            className={[
              'flex h-7 w-7 items-center justify-center rounded-lg transition',
              view === 'list' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setView('board')}
            title="Board view"
            className={[
              'flex h-7 w-7 items-center justify-center rounded-lg transition',
              view === 'board' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="18" rx="2" />
              <rect x="14" y="3" width="7" height="11" rx="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
          style={{ width: `${milestones.length ? (done / milestones.length) * 100 : 0}%` }}
        />
      </div>

      {/* List view */}
      {view === 'list' && (
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
      )}

      {/* Board view */}
      {view === 'board' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 overflow-x-auto">
          {COLUMNS.map((col) => {
            const items = milestones.filter((m) => (m.status ?? 'PENDING') === col.key);
            return (
              <div key={col.key} className="min-w-[140px]">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className="text-[11px] font-semibold text-slate-500">{col.label}</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className={`rounded-xl border border-dashed p-3 text-center text-[11px] text-slate-400 ${col.card}`}>
                      Empty
                    </div>
                  ) : items.map((m) => (
                    <div key={m.id} className={`rounded-xl border p-3 ${col.card}`}>
                      <p className="text-[12px] font-semibold text-slate-800 leading-snug">{m.title}</p>
                      <p className="mt-1 text-[10px] text-slate-400">Due {fmtDate(m.dueDate)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
