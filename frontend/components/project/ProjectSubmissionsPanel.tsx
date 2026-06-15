"use client";
import React from 'react';

export default function ProjectSubmissionsPanel({ submissions }: { submissions?: any[] }) {
  if (!submissions || submissions.length === 0) {
    return <div className="p-6 text-gray-600">No submissions have been made yet.</div>;
  }

  return (
    <div className="rounded border border-gray-100 bg-white p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Submissions</h3>
        <span className="text-sm text-gray-500">{submissions.length} recent</span>
      </div>
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="rounded-lg border border-gray-200 p-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{submission.title}</div>
              <p className="text-sm text-gray-500">Submitted {submission.submittedAt}</p>
            </div>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${submission.status === 'APPROVED' ? 'bg-green-100 text-green-700' : submission.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {submission.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
