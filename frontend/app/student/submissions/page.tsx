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
      <div className="rounded bg-white p-6 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Evidence Submission</h2>
            <p className="mt-1 text-gray-600">Upload documents, links, files, and meeting records with version tracking.</p>
          </div>
          <div className="rounded bg-slate-50 px-4 py-2 text-sm text-slate-700">Statuses: Draft, Submitted, Under Review, Approved, Revision Required</div>
        </div>
      </div>

      {error && <div className="rounded bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <SubmissionForm onSubmit={handleCreateSubmission} isSubmitting={submitting} />
          <VersionHistoryPanel versions={versions} />
        </div>

        <div className="space-y-6">
          <div className="rounded bg-white p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">All Submissions</h3>
            {loading ? <p className="text-gray-500">Loading submissions...</p> : <SubmissionList submissions={submissions} selectedId={selectedId} onSelect={setSelectedId} />}
          </div>
          <SubmissionDiscussionPanel submissionId={selectedId} />
        </div>
      </div>
    </div>
  );
}
