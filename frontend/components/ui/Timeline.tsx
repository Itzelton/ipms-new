"use client";
import React from 'react';

export type TimelineItemProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  timestamp: string;
  badge?: string;
  meta?: string;
};

export function Timeline({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-px bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-8 pl-10">{children}</div>
    </div>
  );
}

export function TimelineItem({ icon, title, description, timestamp, badge, meta }: TimelineItemProps) {
  return (
    <div className="relative">
      <div className="absolute left-[-1.2rem] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="h-2.5 w-2.5 rounded-full bg-sky-400" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-slate-700/60 dark:bg-slate-800/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{title}</p>
            {description && <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            {badge && <span className="rounded-full bg-sky-100 px-2 py-0.5 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-400">{badge}</span>}
            <span>{new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
        {meta && <div className="mt-2.5 rounded-lg bg-white px-3 py-1.5 text-[11px] text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">{meta}</div>}
      </div>
    </div>
  );
}
