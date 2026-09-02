"use client";
import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../services/api';

const statusStyle: Record<string, string> = {
  APPROVED:          'bg-emerald-100 text-emerald-700',
  UNDER_REVIEW:      'bg-amber-100 text-amber-700',
  REVISION_REQUIRED: 'bg-rose-100 text-rose-700',
  SUBMITTED:         'bg-sky-100 text-sky-700',
  DRAFT:             'bg-slate-100 text-slate-600',
};

const evidenceLabel: Record<string, string> = {
  DOCUMENT: 'Document', GITHUB: 'GitHub', WEBSITE: 'Website',
  APK: 'APK', SCREENSHOT: 'Screenshot', DEMO_VIDEO: 'Demo Video',
  MEETING_RECORD: 'Meeting Record',
};

function fmtDate(d: string) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

export default function SupervisorSubmissionsPanel({ submissions: initial, projectId }: { submissions?: any[]; projectId?: string }) {
  const [submissions, setSubmissions] = useState<any[]>(initial ?? []);
  const [fetching, setFetching] = useState(!!projectId);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [remarking, setRemarking] = useState<{ id: string; action: 'APPROVED' | 'REVISION_REQUIRED' } | null>(null);
  const [remark, setRemark] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setFetching(true);
    apiGet(`/submissions?projectId=${projectId}&limit=100`)
      .then((data) => { if (Array.isArray(data)) setSubmissions(data); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [projectId]);

  async function submitReview(id: string, status: string, feedback: string) {
    setUpdating(id);
    try {
      const updated = await apiPatch(`/submissions/${id}`, {
        status,
        ...(feedback.trim() ? { feedback: feedback.trim() } : {}),
      });
      setSubmissions((prev) => prev.map((s) =>
        s.id === id ? { ...s, status: updated?.status ?? status, feedback: updated?.feedback ?? feedback.trim() } : s
      ));
      setRemarking(null);
      setRemark('');
    } catch { /* ignore */ } finally { setUpdating(null); }
  }

  if (fetching) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-400">Loading submissions…</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No submissions yet</p>
        <p className="mt-1 text-xs text-slate-400">Waiting for the student to submit work.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Submissions</p>
        <span className="text-[11px] text-slate-400">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {submissions.map((s) => {
          const badge = statusStyle[s.status] ?? 'bg-slate-100 text-slate-600';
          const canReview = s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW';
          const isUpdating = updating === s.id;
          const isExpanded = expanded === s.id;
          const isRemarking = remarking?.id === s.id;
          const title = s.metadata?.title || s.title || s.content?.slice(0, 60) || 'Submission';
          const fileUrl = s.fileUrl || s.metadata?.fileUrl || s.metadata?.sourceUrl;

          return (
            <li key={s.id} className="py-4 first:pt-0 last:pb-0">
              {/* Header row */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : s.id)}
                      className="text-left text-[13px] font-medium text-slate-800 leading-snug hover:text-sky-700 transition"
                    >
                      {title}
                    </button>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                      {(s.status ?? '').replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Meta line */}
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="text-[11px] text-slate-400">{fmtDate(s.submittedAt ?? s.createdAt)}</span>
                    {s.evidenceType && (
                      <span className="text-[11px] text-slate-400">· {evidenceLabel[s.evidenceType] ?? s.evidenceType}</span>
                    )}
                    {s.milestone?.title && (
                      <span className="text-[11px] text-slate-400">· Milestone: <span className="font-medium text-slate-600">{s.milestone.title}</span></span>
                    )}
                  </div>

                  {/* Expand toggle hint */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : s.id)}
                    className="mt-1 text-[11px] text-sky-600 hover:text-sky-700"
                  >
                    {isExpanded ? 'Hide details ▲' : 'View details ▼'}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 ml-12 space-y-3">
                  {s.content && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Student Notes</p>
                      <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{s.content}</p>
                    </div>
                  )}

                  {fileUrl && (
                    <div className="flex items-center gap-3">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200 px-3 py-1.5 text-[12px] font-medium text-sky-700 hover:bg-sky-100 transition no-underline"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open / Preview file
                      </a>
                      <a
                        href={fileUrl}
                        download
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition no-underline"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  )}

                  {/* Existing feedback */}
                  {s.feedback && (
                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 mb-1">Your Remarks</p>
                      <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{s.feedback}</p>
                    </div>
                  )}

                  {/* Review actions */}
                  {canReview && !isRemarking && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setRemarking({ id: s.id, action: 'APPROVED' }); setRemark(''); }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setRemarking({ id: s.id, action: 'REVISION_REQUIRED' }); setRemark(''); }}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 transition"
                      >
                        Request Revision
                      </button>
                    </div>
                  )}

                  {/* Inline remark form */}
                  {isRemarking && remarking && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <p className="text-[12px] font-semibold text-slate-700">
                        {remarking.action === 'APPROVED' ? '✓ Approving' : '⚠ Requesting Revision'} — add remarks (optional)
                      </p>
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        rows={3}
                        placeholder={remarking.action === 'APPROVED'
                          ? 'e.g. Well done! Clear presentation and good use of sources.'
                          : 'e.g. Please expand section 2 and fix the citation format.'}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm resize-none focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setRemarking(null); setRemark(''); }}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => submitReview(s.id, remarking.action, remark)}
                          className={`rounded-lg px-4 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50 transition ${
                            remarking.action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                          }`}
                        >
                          {isUpdating ? 'Saving…' : remarking.action === 'APPROVED' ? 'Confirm Approval' : 'Send Revision Request'}
                        </button>
                      </div>
                    </div>
                  )}

                  {s.status === 'APPROVED' && !canReview && (
                    <p className="text-[11px] font-medium text-emerald-600">✓ Approved</p>
                  )}
                  {s.status === 'REVISION_REQUIRED' && !canReview && (
                    <p className="text-[11px] font-medium text-rose-600">⚠ Revision requested — awaiting resubmission</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
