"use client";
import React, { useState } from 'react';
import { apiPatch } from '../../services/api';

function studentName(student: any) {
  if (!student) return 'Student';
  return student.preferredName || [student.firstName, student.lastName].filter(Boolean).join(' ') || student.email || 'Student';
}

export default function ProposalReviewPanel({ project, onStatusChange }: { project: any; onStatusChange: (status: string) => void }) {
  const [action, setAction] = useState<'ACTIVE' | 'CANCELLED' | null>(null);
  const [error, setError] = useState('');

  async function decide(status: 'ACTIVE' | 'CANCELLED') {
    setAction(status);
    setError('');
    try {
      await apiPatch(`/projects/${project.id}/status`, { status });
      onStatusChange(status);
    } catch (err: any) {
      setError(err?.message || 'The proposal decision could not be saved. Please try again.');
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="card overflow-hidden border border-amber-200">
      <div className="border-b border-amber-100 bg-amber-50 px-5 py-4">
        <p className="text-sm font-semibold text-amber-900">Proposal awaiting your review</p>
        <p className="mt-1 text-xs text-amber-700">Review the student’s project summary and attached document before making a decision.</p>
      </div>
      <div className="space-y-4 p-5">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div><p className="text-xs text-slate-400">Submitted by</p><p className="font-medium text-slate-700">{studentName(project.student)}</p></div>
          <div><p className="text-xs text-slate-400">Project type</p><p className="font-medium text-slate-700">{(project.type ?? 'OTHER').replace(/_/g, ' ')}</p></div>
        </div>
        {project.proposalDocUrl ? (
          <a href={project.proposalDocUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 no-underline hover:bg-sky-100">
            View submitted proposal document
          </a>
        ) : <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">No document was attached to this proposal.</p>}
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button onClick={() => decide('ACTIVE')} disabled={action !== null}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {action === 'ACTIVE' ? 'Accepting…' : 'Accept proposal'}
          </button>
          <button onClick={() => decide('CANCELLED')} disabled={action !== null}
            className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
            {action === 'CANCELLED' ? 'Rejecting…' : 'Reject proposal'}
          </button>
        </div>
      </div>
    </section>
  );
}
