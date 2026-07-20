"use client";
import React from 'react';

export default function VersionHistoryPanel({ versions }: { versions?: any[] }) {
  if (!versions || versions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">Select a submission to view version history</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Version History</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {versions.length} versions
        </span>
      </div>
      <ul className="divide-y divide-slate-100">
        {versions.map((version) => (
          <li key={version.id} className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <span className="text-[11px] font-bold text-slate-500">v{version.versionNumber}</span>
              </div>
              <div className="min-w-0">
                {version.metadata?.title && (
                  <p className="truncate text-[13px] font-medium text-slate-800">{version.metadata.title}</p>
                )}
                <p className="text-[11px] text-slate-400">
                  {new Date(version.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {version.evidenceType || 'Evidence'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
