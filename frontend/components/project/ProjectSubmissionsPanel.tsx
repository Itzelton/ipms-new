"use client";
import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../services/api';

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
  const [milestones, setMilestones] = useState<any[]>([]);
  const [fetching, setFetching] = useState(!!projectId);
  const [showForm, setShowForm] = useState(false);

  const [milestoneId, setMilestoneId] = useState('');
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setFetching(true);
    Promise.allSettled([
      apiGet(`/submissions?projectId=${projectId}&limit=100`),
      apiGet(`/milestones?projectId=${projectId}&limit=100`),
    ]).then(([subRes, msRes]) => {
      if (subRes.status === 'fulfilled' && Array.isArray(subRes.value)) setSubmissions(subRes.value);
      if (msRes.status === 'fulfilled' && Array.isArray(msRes.value)) setMilestones(msRes.value);
    }).finally(() => setFetching(false));
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!milestoneId) { setError('Please select a milestone.'); return; }
    if (!content.trim()) { setError('Please add some notes about your submission.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const s = await apiPost('/submissions', {
        projectId,
        milestoneId,
        content: content.trim(),
        fileUrl: fileUrl.trim() || undefined,
      });
      setSubmissions((prev) => [s, ...prev]);
      setMilestoneId('');
      setContent('');
      setFileUrl('');
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

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
        {projectId && (
          <button
            onClick={() => { setShowForm((v) => !v); setError(''); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700 transition"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {showForm ? 'Cancel' : 'New Submission'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          {error && <p className="text-[12px] text-rose-600">{error}</p>}

          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">
              Milestone <span className="text-rose-500">*</span>
            </label>
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              <option value="">— Select a milestone —</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            {milestones.length === 0 && (
              <p className="mt-1 text-[11px] text-slate-400">No milestones defined yet. Your supervisor must add milestones before you can submit.</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">
              Notes / Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Describe what you've done for this milestone..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">File / Link URL</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://drive.google.com/... or GitHub link"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting || milestones.length === 0} className="rounded-lg bg-sky-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition">
              {submitting ? 'Submitting…' : 'Submit Work'}
            </button>
          </div>
        </form>
      )}

      {submissions.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-400">No submissions yet. Click "New Submission" to submit your work.</p>
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
