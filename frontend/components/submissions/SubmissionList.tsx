"use client";
import React from 'react';
import { SubmissionStatus } from '../../services/submission';

function statusClass(status: SubmissionStatus) {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-700';
    case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-700';
    case 'REVISION_REQUIRED': return 'bg-red-100 text-red-700';
    case 'SUBMITTED': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function SubmissionList({ submissions, selectedId, onSelect }: { submissions?: any[]; selectedId?: string | null; onSelect: (id: string) => void }) {
  if (!submissions || submissions.length === 0) {
    return <div className="rounded bg-white p-6 shadow">No submissions yet.</div>;
  }

  return (
    <div className="rounded bg-white p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Evidence Submissions</h3>
      <div className="space-y-3">
        {submissions.map((submission) => (
          <button
            key={submission.id}
            onClick={() => onSelect(submission.id)}
            className={`w-full text-left rounded border p-4 transition ${selectedId === submission.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{submission.project?.title || submission.content}</div>
                <p className="text-sm text-gray-500">{submission.evidenceType || 'Evidence'} · {new Date(submission.submittedAt).toLocaleDateString()}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(submission.status)}`}>{submission.status}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
