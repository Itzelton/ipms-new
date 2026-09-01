"use client";
import React from 'react';
import Link from 'next/link';

export default function ActiveProjectCard({ project }: { project: any }) {
  if (!project) return (
    <div className="card p-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No active project</p>
        <p className="mt-1 text-xs text-slate-400">Submit a proposal to get started.</p>
        <Link
          href="/student/projects"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-sky-700 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Proposal
        </Link>
      </div>
    </div>
  );

  const progress = Math.min(100, Math.max(0, project.progress ?? 0));

  return (
    <Link href={`/student/projects/${project.id}`} className="card block p-6 no-underline hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Active Project</p>
            <h3 className="mt-0.5 text-base font-semibold text-slate-900 leading-tight">{project.title}</h3>
          </div>
        </div>
        <span className="flex-shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[12px] font-bold text-sky-600 tabular-nums">
          {progress}%
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[12px] text-slate-400">
          <span>Progress</span>
          <span className="font-medium text-slate-600">{progress} of 100%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[12px] text-slate-500">In progress</span>
        </div>
        <span className="flex items-center gap-1 text-[12px] font-semibold text-sky-600">
          View Insights
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
