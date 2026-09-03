"use client";
import React from 'react';

const statConfig = [
  {
    key: 'activeProjects',
    label: 'Active Projects',
    icon: (
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
    gradient: 'from-sky-400 to-blue-600',
    valueClass: 'text-sky-600',
  },
  {
    key: 'reviewQueue',
    label: 'Review Queue',
    icon: (
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    gradient: 'from-violet-400 to-indigo-600',
    valueClass: 'text-violet-600',
  },
  {
    key: 'averageTurnaround',
    label: 'Avg Turnaround',
    icon: (
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-amber-400 to-orange-500',
    valueClass: 'text-amber-600',
  },
  {
    key: 'riskProjects',
    label: 'At Risk',
    icon: (
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    gradient: 'from-rose-400 to-rose-600',
    valueClass: 'text-rose-600',
  },
];

export default function AnalyticsSummaryCard({ summary }: { summary?: any }) {
  if (!summary) return (
    <div className="card p-6">
      <p className="text-sm text-slate-500">Analytics not available.</p>
    </div>
  );

  return (
    <div className="card p-6">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Analytics Overview</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statConfig.map(({ key, label, icon, gradient, valueClass }) => (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/60 dark:bg-slate-800/60"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
              {icon}
            </div>
            <div>
              <p className={`text-2xl font-bold tabular-nums ${valueClass}`}>{summary[key] ?? '—'}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
