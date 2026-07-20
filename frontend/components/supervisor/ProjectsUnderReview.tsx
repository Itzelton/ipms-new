"use client";
import React from 'react';

const statusStyle: Record<string, string> = {
  REVIEW_PENDING: 'bg-amber-100 text-amber-700',
  IN_REVIEW:      'bg-violet-100 text-violet-700',
  ACTIVE:         'bg-sky-100 text-sky-700',
};

function fmtDate(d: string) {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(d));
  } catch { return d; }
}

export default function ProjectsUnderReview({ projects }: { projects?: any[] }) {
  const isEmpty = !projects || projects.length === 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Projects Under Review</p>
        {!isEmpty && (
          <span className="text-[11px] text-slate-400">{projects!.length} active</span>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-slate-500">No projects under review</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {projects!.map((project) => {
            const badge = statusStyle[project.status] ?? 'bg-slate-100 text-slate-600';
            return (
              <li key={project.id} className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-800">{project.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                      {(project.status ?? '').replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">{project.student} · Due {fmtDate(project.dueDate)}</span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors">
                    Review
                  </button>
                  <button
                    className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors"
                    style={{ background: 'rgba(248,250,252,0.80)', border: '1px solid rgba(226,232,240,0.80)' }}
                  >
                    Details
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
