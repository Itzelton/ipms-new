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
      <div className="absolute left-4 top-0 h-full w-px bg-slate-200" />
      <div className="space-y-8 pl-10">{children}</div>
    </div>
  );
}

export function TimelineItem({ icon, title, description, timestamp, badge, meta }: TimelineItemProps) {
  return (
    <div className="relative">
      <div className="absolute left-[-1.2rem] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">{icon ?? <span className="text-xs font-semibold">•</span>}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {badge && <span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-800">{badge}</span>}
            <span>{new Date(timestamp).toLocaleDateString()}</span>
          </div>
        </div>
        {meta && <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-slate-500">{meta}</div>}
      </div>
    </div>
  );
}
