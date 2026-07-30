"use client";
import React, { useEffect, useState } from 'react';
import { createSubmission, getSubmissions, getSubmissionVersions } from '../../../services/submission';
import SubmissionForm from '../../../components/submissions/SubmissionForm';
import SubmissionList from '../../../components/submissions/SubmissionList';
import VersionHistoryPanel from '../../../components/submissions/VersionHistoryPanel';
import SubmissionDiscussionPanel from '../../../components/submissions/SubmissionDiscussionPanel';

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const items = await getSubmissions();
      setSubmissions(items);
      if (!selectedId && items.length > 0) setSelectedId(items[0].id);
    } catch (err) {
      setError('Unable to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setVersions([]);
      return;
    }

    getSubmissionVersions(selectedId).then(setVersions).catch(() => setVersions([]));
  }, [selectedId]);

  const handleCreateSubmission = async (payload: any) => {
    setSubmitting(true);
    setError(null);
    try {
      await createSubmission(payload);
      await loadSubmissions();
    } catch (err) {
      setError('Unable to submit evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-static p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">Submissions</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Evidence Submission</h2>
            <p className="mt-1 text-sm text-slate-500">Upload documents, links, files, and meeting records with version tracking.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Draft', 'Submitted', 'Under Review', 'Approved', 'Revision Required'].map((s) => (
              <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <SubmissionForm onSubmit={handleCreateSubmission} isSubmitting={submitting} />
          <VersionHistoryPanel versions={versions} />
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-sm">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">History</p>
                <p className="text-sm font-semibold text-slate-900">All Submissions</p>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
              </div>
            ) : (
              <SubmissionList submissions={submissions} selectedId={selectedId} onSelect={setSelectedId} />
            )}
          </div>
          <SubmissionDiscussionPanel submissionId={selectedId} />
        </div>
      </div>
    </div>
  );
}
