"use client";
import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiUpload, invalidateApiCache } from '../../services/api';

function fmtDate(d: string) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

function isOverdue(m: any) {
  return m.status !== 'COMPLETED' && new Date(m.dueDate) < new Date();
}

type Stage = 'locked' | 'active' | 'under_review' | 'completed' | 'overdue';

function getStage(m: any, submissions: any[], index: number, milestones: any[]): Stage {
  if (m.status === 'COMPLETED') return 'completed';
  const sub = submissions.find((s: any) => s.milestoneId === m.id);
  if (sub && (sub.status === 'SUBMITTED' || sub.status === 'UNDER_REVIEW')) return 'under_review';
  if (isOverdue(m)) return 'overdue';
  // locked if any previous milestone is not completed
  const prevIncomplete = milestones.slice(0, index).some((prev) => prev.status !== 'COMPLETED');
  if (prevIncomplete) return 'locked';
  return 'active';
}

const stageConfig: Record<Stage, { icon: React.ReactNode; badge: string; label: string; ring: string }> = {
  completed:    {
    icon: <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
    badge: 'bg-emerald-100 text-emerald-700', label: 'Completed', ring: 'ring-emerald-200 bg-emerald-50',
  },
  under_review: {
    icon: <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>,
    badge: 'bg-amber-100 text-amber-700', label: 'Awaiting review', ring: 'ring-amber-200 bg-amber-50',
  },
  active:       {
    icon: <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    badge: 'bg-sky-100 text-sky-700', label: 'Current stage', ring: 'ring-sky-200 bg-sky-50',
  },
  overdue:      {
    icon: <svg className="h-5 w-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>,
    badge: 'bg-rose-100 text-rose-700', label: 'Overdue', ring: 'ring-rose-200 bg-rose-50',
  },
  locked:       {
    icon: <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
    badge: 'bg-slate-100 text-slate-500', label: 'Locked', ring: 'ring-slate-200 bg-slate-50',
  },
};

function UploadForm({ milestone, projectId, onSubmitted }: { milestone: any; projectId: string; onSubmitted: () => void }) {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [evidenceType, setEvidenceType] = useState('DOCUMENT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const needsFile = ['DOCUMENT', 'APK', 'SCREENSHOT'].includes(evidenceType);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!needsFile && !url.trim()) { setError('Please provide a URL.'); return; }
    if (needsFile && !file) { setError('Please select a file to upload.'); return; }
    setSaving(true); setError('');
    try {
      let fileUrl = url.trim() || undefined;
      if (file) {
        const form = new FormData();
        form.append('file', file);
        const upload = await apiUpload('/uploads', form);
        fileUrl = upload?.url || upload?.fileUrl || upload;
      }
      await apiPost('/submissions', {
        projectId,
        milestoneId: milestone.id,
        content: notes.trim() || milestone.title,
        evidenceType,
        fileUrl,
        status: 'SUBMITTED',
        metadata: { title: milestone.title },
      });
      onSubmitted();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit. Please try again.');
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-xl border border-sky-100 bg-white p-4 space-y-3">
      <p className="text-[12px] font-semibold text-slate-700">Submit your work for this milestone</p>

      {error && <p className="text-[12px] text-rose-600">{error}</p>}

      <div>
        <label className="block text-[11px] font-medium text-slate-600 mb-1">Evidence type</label>
        <select
          value={evidenceType}
          onChange={(e) => { setEvidenceType(e.target.value); setFile(null); setUrl(''); }}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
        >
          <option value="DOCUMENT">Document (PDF, Word…)</option>
          <option value="GITHUB">GitHub Repository</option>
          <option value="WEBSITE">Website URL</option>
          <option value="APK">APK File</option>
          <option value="SCREENSHOT">Screenshot</option>
          <option value="DEMO_VIDEO">Demo Video Link</option>
        </select>
      </div>

      {needsFile ? (
        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">File <span className="text-rose-500">*</span></label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
          />
        </div>
      ) : (
        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">URL <span className="text-rose-500">*</span></label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-[11px] font-medium text-slate-600 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any notes for your supervisor..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm resize-none focus:border-sky-400 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={saving} className="rounded-lg bg-sky-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition">
          {saving ? 'Submitting…' : 'Submit for review'}
        </button>
      </div>
    </form>
  );
}

export default function ProjectMilestonesPanel({ milestones: initial, projectId }: { milestones?: any[]; projectId?: string }) {
  const [milestones, setMilestones] = useState<any[]>(initial ?? []);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(!!projectId);
  const [uploading, setUploading] = useState<string | null>(null);

  function reload() {
    if (!projectId) return;
    invalidateApiCache(`/milestones?projectId=${projectId}&limit=100`);
    invalidateApiCache(`/submissions?projectId=${projectId}&limit=100`);
    Promise.allSettled([
      apiGet(`/milestones?projectId=${projectId}&limit=100`),
      apiGet(`/submissions?projectId=${projectId}&limit=100`),
    ]).then(([mRes, sRes]) => {
      if (mRes.status === 'fulfilled' && Array.isArray(mRes.value)) setMilestones(mRes.value);
      if (sRes.status === 'fulfilled' && Array.isArray(sRes.value)) setSubmissions(sRes.value);
    }).catch(() => {}).finally(() => setFetching(false));
  }

  useEffect(() => {
    if (!projectId) return;
    reload();
  }, [projectId]);

  if (fetching) {
    return <div className="card p-8 text-center"><p className="text-sm text-slate-400">Loading milestones…</p></div>;
  }

  if (!milestones.length) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No milestones yet</p>
        <p className="mt-1 text-xs text-slate-400">Your supervisor will define the stages for this project.</p>
      </div>
    );
  }

  const done = milestones.filter((m) => m.status === 'COMPLETED').length;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Project Stages</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{done}/{milestones.length} complete</p>
        </div>
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
          style={{ width: `${milestones.length ? (done / milestones.length) * 100 : 0}%` }}
        />
      </div>

      <ol className="relative space-y-0">
        {milestones.map((m, i) => {
          const stage = getStage(m, submissions, i, milestones);
          const cfg = stageConfig[stage];
          const isLast = i === milestones.length - 1;
          const isUploading = uploading === m.id;
          const existingSub = submissions.find((s: any) => s.milestoneId === m.id);

          return (
            <li key={m.id} className="flex gap-4">
              {/* Spine */}
              <div className="flex flex-col items-center">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ring-2 ${cfg.ring}`}>
                  {cfg.icon}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-slate-100 my-1" />}
              </div>

              {/* Content */}
              <div className={`pb-6 min-w-0 flex-1 ${isLast ? '' : ''}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-slate-800">{m.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Due {fmtDate(m.dueDate)}</p>
                  </div>
                </div>

                {/* Requirements box */}
                {m.requirements && (
                  <div className="mt-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-600 mb-0.5">What to submit</p>
                    <p className="text-[12px] text-slate-700 whitespace-pre-wrap">{m.requirements}</p>
                  </div>
                )}

                {m.description && (
                  <p className="mt-1.5 text-[12px] text-slate-500">{m.description}</p>
                )}

                {/* Existing submission status */}
                {existingSub && stage !== 'completed' && (
                  <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                    <span className="font-semibold">Submitted</span> — awaiting supervisor review.
                    {existingSub.feedback && (
                      <p className="mt-1 text-[11px] text-amber-700 italic">"{existingSub.feedback}"</p>
                    )}
                  </div>
                )}

                {/* Revision requested */}
                {existingSub?.status === 'REVISION_REQUIRED' && (
                  <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">
                    <span className="font-semibold">Revision requested</span>
                    {existingSub.feedback && <p className="mt-0.5 italic">"{existingSub.feedback}"</p>}
                    <button
                      onClick={() => setUploading(isUploading ? null : m.id)}
                      className="mt-1.5 rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-700 transition"
                    >
                      Resubmit
                    </button>
                  </div>
                )}

                {/* Upload button for active stage */}
                {(stage === 'active' || stage === 'overdue') && !existingSub && (
                  <button
                    onClick={() => setUploading(isUploading ? null : m.id)}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700 transition"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload &amp; Submit
                  </button>
                )}

                {/* Inline upload form */}
                {isUploading && projectId && (
                  <UploadForm
                    milestone={m}
                    projectId={projectId}
                    onSubmitted={() => { setUploading(null); reload(); }}
                  />
                )}

                {/* Locked hint */}
                {stage === 'locked' && (
                  <p className="mt-1.5 text-[11px] text-slate-400">Complete the previous stage first.</p>
                )}

                {/* Completed */}
                {stage === 'completed' && (
                  <p className="mt-1.5 text-[11px] font-medium text-emerald-600">✓ Approved by supervisor</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
