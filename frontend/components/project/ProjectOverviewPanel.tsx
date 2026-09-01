"use client";
import React from 'react';

function displayName(value: any): string {
  if (!value) return '—';
  if (typeof value === 'string') return value;
  return [value.firstName, value.lastName].filter(Boolean).join(' ') || value.email || '—';
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex flex-col gap-0.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-slate-400 truncate">{label}</p>
      <p className="text-[13px] font-semibold text-slate-800 truncate" title={value}>{value}</p>
    </div>
  );
}

export default function ProjectOverviewPanel({ project }: { project: any }) {
  const progress = Math.min(100, Math.max(0, project.progress ?? 0));
  const progressColor =
    progress >= 70 ? 'from-emerald-400 to-teal-500' :
    progress >= 40 ? 'from-amber-400 to-orange-400' :
    'from-rose-400 to-red-500';

  return (
    <div className="card p-6 space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Overview</p>
        <p className="mt-0.5 text-sm text-slate-500">Key details and progress at a glance.</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-medium text-slate-500">Progress</span>
          <span className="font-bold tabular-nums text-slate-700">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <StatCell label="Student"   value={displayName(project.student)} />
        <StatCell label="Supervisor" value={displayName(project.supervisor)} />
        <StatCell label="Start date" value={fmtDate(project.startDate)} />
        <StatCell label="Due date"   value={fmtDate(project.dueDate ?? project.expectedEndDate)} />
      </div>
    </div>
  );
}
