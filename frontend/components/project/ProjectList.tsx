"use client";
import React from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';

export default function ProjectList({ projects, role = 'STUDENT' }: { projects: any[]; role?: string }) {
  if (!projects || projects.length === 0) {
    const newHref = role === 'STUDENT' ? '/student/projects' : '/supervisor/projects';
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">No projects yet</p>
        {role === 'STUDENT' && (
          <>
            <p className="mt-1 text-xs text-slate-400">Submit a proposal to get your first project started.</p>
            <Link
              href={newHref}
              className="mt-4 inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-sky-700 transition"
            >
              + New Proposal
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} role={role} />
      ))}
    </div>
  );
}
