"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiGet, apiPatch } from '../../../services/api';
import { useAuth } from '../../../components/auth/auth-context';

type Submission = {
  id: string;
  content: string;
  status: string;
  feedback?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; title: string; supervisorId?: string };
  author?: { firstName?: string; lastName?: string; email: string };
  milestone?: { title: string };
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    SUBMITTED:         'badge-blue',
    UNDER_REVIEW:      'badge-yellow',
    APPROVED:          'badge-green',
    REVISION_REQUIRED: 'badge-red',
    DRAFT:             'badge-gray',
  };
  const label: Record<string, string> = {
    SUBMITTED:         'Submitted',
    UNDER_REVIEW:      'Under Review',
    APPROVED:          'Approved',
    REVISION_REQUIRED: 'Revision Required',
    DRAFT:             'Draft',
  };
  return <span className={map[status] || 'badge-gray'}>{label[status] || status}</span>;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function avgHours(subs: Submission[]) {
  const reviewed = subs.filter(s => ['APPROVED','REVISION_REQUESTED'].includes(s.status) && s.createdAt && s.updatedAt);
  if (!reviewed.length) return '—';
  const avg = reviewed.reduce((sum, s) => {
    return sum + (new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime());
  }, 0) / reviewed.length;
  const h = Math.round(avg / 3_600_000);
  return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
}

export default function SupervisorReviewsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('submissionId');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(highlightId);
  const [remark, setRemark] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setFetchError(null);
    apiGet('/submissions/for-supervisor?limit=200')
      .then((res: any) => {
        const all: Submission[] = Array.isArray(res) ? res : res?.data ?? [];
        setSubmissions(all);
      })
      .catch((err: any) => {
        setFetchError(err?.message || 'Failed to load submissions');
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Scroll highlighted submission into view once loaded
  useEffect(() => {
    if (!highlightId || loading) return;
    const el = document.getElementById(`sub-${highlightId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightId, loading]);

  async function act(id: string, status: 'APPROVED' | 'REVISION_REQUESTED') {
    setActing(id);
    try {
      const updated = await apiPatch(`/submissions/${id}`, { status, feedback: remark || undefined });
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updated, status } : s));
      setExpanded(null);
      setRemark('');
    } catch { /* ignore */ }
    finally { setActing(null); }
  }

  const pending  = submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW');
  const drafts   = submissions.filter(s => s.status === 'DRAFT');
  const reviewed = submissions.filter(s => s.status === 'APPROVED' || s.status === 'REVISION_REQUIRED');
  const overdue  = pending.filter(s => {
    const age = Date.now() - new Date(s.createdAt).getTime();
    return age > 7 * 24 * 3_600_000;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-28 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0,1,2].map(i => <div key={i} className="skeleton h-24" />)}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-rose-600">Failed to load submissions</p>
        <p className="mt-1 text-xs text-slate-400">{fetchError}</p>
        <button
          onClick={() => { setLoading(true); setFetchError(null); apiGet('/submissions/for-supervisor?limit=200').then((res: any) => { const all: Submission[] = Array.isArray(res) ? res : res?.data ?? []; setSubmissions(all); }).catch((err: any) => setFetchError(err?.message || 'Failed')).finally(() => setLoading(false)); }}
          className="mt-3 text-xs font-medium text-sky-600 hover:text-sky-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-2xl font-semibold text-slate-900">Review Queue</h3>
        <p className="mt-1 text-slate-500">Review student submissions and approve milestones.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-static p-6">
          <p className="text-sm font-medium text-slate-500">Pending reviews</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{pending.length}</p>
        </div>
        <div className="card-static p-6">
          <p className="text-sm font-medium text-slate-500">Overdue (&gt;7 days)</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600">{overdue.length}</p>
        </div>
        <div className="card-static p-6">
          <p className="text-sm font-medium text-slate-500">Avg turnaround</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{avgHours(submissions)}</p>
        </div>
      </div>

      {/* Pending submissions */}
      <div className="card p-6">
        <h4 className="mb-4 text-base font-semibold text-slate-900">
          Pending ({pending.length})
        </h4>

        {pending.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-2xl">✓</p>
            <p className="mt-2 text-sm font-medium text-slate-700">All caught up</p>
            <p className="mt-1 text-xs text-slate-500">No submissions awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.map(s => {
              const name = [s.author?.firstName, s.author?.lastName].filter(Boolean).join(' ') || s.author?.email || 'Student';
              const isOpen = expanded === s.id;
              const isHighlighted = highlightId === s.id;
              const age = Math.floor((Date.now() - new Date(s.createdAt).getTime()) / 3_600_000);
              return (
                <div key={s.id} id={`sub-${s.id}`} className={`py-4 rounded-xl transition-colors ${isHighlighted ? 'ring-2 ring-sky-400 ring-offset-2 bg-sky-50/60 px-3' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{name}</span>
                        {statusBadge(s.status)}
                        {age > 168 && <span className="badge-red">Overdue</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {s.project?.title ?? 'Unknown project'}{s.milestone ? ` · ${s.milestone.title}` : ''} · {fmt(s.createdAt)}
                      </p>
                      {s.content && <p className="mt-1 text-sm text-slate-700 line-clamp-2">{s.content}</p>}
                    </div>
                    <button
                      onClick={() => { setExpanded(isOpen ? null : s.id); setRemark(''); }}
                      className="shrink-0 text-xs font-medium text-sky-600 hover:text-sky-700"
                    >
                      {isOpen ? 'Close' : 'Review'}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
                      {s.fileUrl && (
                        <a href={s.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View attachment
                        </a>
                      )}
                      <textarea
                        value={remark}
                        onChange={e => setRemark(e.target.value)}
                        rows={3}
                        placeholder="Add feedback / remarks (optional)…"
                        className="input resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={acting === s.id}
                          onClick={() => act(s.id, 'APPROVED')}
                          className="btn-primary flex-1 py-2 text-xs"
                        >
                          {acting === s.id ? 'Saving…' : 'Approve'}
                        </button>
                        <button
                          disabled={acting === s.id}
                          onClick={() => act(s.id, 'REVISION_REQUIRED')}
                          className="flex-1 rounded-full border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                        >
                          Request Revision
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Draft submissions */}
      {drafts.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-4 text-base font-semibold text-slate-900">Drafts ({drafts.length})</h4>
          <div className="divide-y divide-slate-100">
            {drafts.map(s => {
              const name = [s.author?.firstName, s.author?.lastName].filter(Boolean).join(' ') || s.author?.email || 'Student';
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500">{s.project?.title ?? '—'}{s.milestone ? ` · ${s.milestone.title}` : ''} · {fmt(s.createdAt)}</p>
                    {s.content && <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{s.content}</p>}
                  </div>
                  {statusBadge(s.status)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently reviewed */}
      {reviewed.length > 0 && (
        <div className="card p-6">
          <h4 className="mb-4 text-base font-semibold text-slate-900">Recently Reviewed ({reviewed.length})</h4>
          <div className="divide-y divide-slate-100">
            {reviewed.slice(0, 10).map(s => {
              const name = [s.author?.firstName, s.author?.lastName].filter(Boolean).join(' ') || s.author?.email || 'Student';
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500">{s.project?.title ?? '—'} · {fmt(s.updatedAt)}</p>
                  </div>
                  {statusBadge(s.status)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
