"use client";
import React from 'react';
import { SubmissionStatus } from '../../services/submission';

const statusStyle: Record<string, string> = {
  APPROVED:          'bg-emerald-100 text-emerald-700',
  UNDER_REVIEW:      'bg-amber-100 text-amber-700',
  REVISION_REQUIRED: 'bg-rose-100 text-rose-700',
  SUBMITTED:         'bg-sky-100 text-sky-700',
};

export default function SubmissionList({ submissions, selectedId, onSelect }: {
  submissions?: any[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No submissions yet</p>
        <p className="mt-1 text-xs text-slate-400">Upload your first submission to get started</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Evidence Submissions</p>
      <div className="space-y-2">
        {submissions.map((submission) => {
          const isSelected = selectedId === submission.id;
          const badge = statusStyle[submission.status] ?? 'bg-slate-100 text-slate-600';
          const date = submission.submittedAt ?? submission.createdAt;
          const dateStr = date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

          return (
            <button
              key={submission.id}
              onClick={() => onSelect(submission.id)}
              className={`w-full rounded-xl p-4 text-left transition-all ${
                isSelected
                  ? 'bg-sky-50 ring-1 ring-sky-200'
                  : 'hover:bg-slate-50/70'
              }`}
              style={isSelected ? {} : { border: '1px solid rgba(226,232,240,0.60)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-sky-100' : 'bg-slate-100'}`}>
                    <svg className={`h-4 w-4 ${isSelected ? 'text-sky-500' : 'text-slate-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-slate-800">
                      {submission.project?.title || submission.content || 'Untitled submission'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {submission.evidenceType || 'Evidence'} · {dateStr}
                    </p>
                  </div>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                  {(submission.status ?? '').replace(/_/g, ' ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
