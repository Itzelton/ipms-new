"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '../../services/api';

const statusStyle: Record<string, string> = {
  APPROVED:          'bg-emerald-100 text-emerald-700',
  UNDER_REVIEW:      'bg-amber-100 text-amber-700',
  REVISION_REQUIRED: 'bg-rose-100 text-rose-700',
  SUBMITTED:         'bg-sky-100 text-sky-700',
};

function fmtDate(d: string) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

export default function ProjectSubmissionsPanel({ submissions: initial, projectId }: { submissions?: any[]; projectId?: string }) {
  const [submissions, setSubmissions] = useState<any[]>(initial ?? []);
  const [fetching, setFetching] = useState(!!projectId);

  useEffect(() => {
    if (!projectId) return;
    setFetching(true);
    apiGet(`/submissions?projectId=${projectId}&limit=100`)
      .then((data) => { if (Array.isArray(data)) setSubmissions(data); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [projectId]);

  if (fetching) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-400">Loading submissions…</p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Submissions</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
        </div>
        {submissions.length > 0 && (
          <Link
            href="/student/submissions"
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700 transition no-underline"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Submission
          </Link>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">No submissions yet</p>
          <Link
            href="/student/submissions"
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-sky-600 hover:text-sky-700 no-underline"
          >
            Click here to add a submission
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {submissions.map((s) => {
            const badge = statusStyle[s.status] ?? 'bg-slate-100 text-slate-600';
            return (
              <li key={s.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-slate-800">{s.title || s.content?.slice(0, 60) || 'Submission'}</p>
                        {s.milestone && <p className="text-[11px] text-slate-400">Milestone: {s.milestone.title}</p>}
                        <p className="text-[11px] text-slate-400">Submitted {fmtDate(s.submittedAt ?? s.createdAt)}</p>
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                        {(s.status ?? '').replace(/_/g, ' ')}
                      </span>
                    </div>
                    {(s.fileUrl || s.metadata?.fileUrl) && (
                      <a
                        href={s.fileUrl ?? s.metadata?.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700 no-underline"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View file
                      </a>
                    )}
                    {s.status === 'REVISION_REQUIRED' && (
                      <p className="mt-1.5 text-[11px] font-medium text-rose-600">Revision requested — please resubmit</p>
                    )}
                    {s.status === 'APPROVED' && (
                      <p className="mt-1.5 text-[11px] font-medium text-emerald-600">Approved by supervisor</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
