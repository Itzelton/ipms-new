"use client";
import React from 'react';
import Link from 'next/link';

const statusStyle: Record<string, string> = {
  ACTIVE:          'bg-emerald-100 text-emerald-700',
  REVIEW_PENDING:  'bg-amber-100 text-amber-700',
  IN_REVIEW:       'bg-violet-100 text-violet-700',
  AT_RISK:         'bg-rose-100 text-rose-700',
  COMPLETED:       'bg-sky-100 text-sky-700',
  PENDING:         'bg-slate-100 text-slate-600',
};

export default function ProjectCard({ project, role = 'STUDENT' }: { project: any; role?: string }) {
  const href =
    role === 'SUPERVISOR' ? `/supervisor/projects/${project.id}` :
    role === 'ADMIN'      ? `/admin/projects/${project.id}`      :
    `/student/projects/${project.id}`;

  const progress = Math.min(100, Math.max(0, project.progress ?? 0));
  const badge = statusStyle[project.status] ?? 'bg-slate-100 text-slate-600';
  const statusLabel = (project.status ?? 'Unknown').replace(/_/g, ' ');

  return (
    <Link
      href={href}
      className="card block p-5 no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-slate-900">{project.title}</p>
          {project.description && (
            <p className="mt-0.5 text-[12px] text-slate-500 line-clamp-1">{project.description}</p>
          )}
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Progress</span>
          <span className="font-semibold tabular-nums text-slate-600">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {(project.dueDate || project.student) && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          {project.student && (
            <span>
              {typeof project.student === 'string' ? project.student : [project.student?.firstName, project.student?.lastName].filter(Boolean).join(' ') || project.student?.email || '—'}
            </span>
          )}
          {project.dueDate && (
            <span>
              Due {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(project.dueDate))}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
