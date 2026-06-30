"use client";
import React from 'react';

export default function RecentSubmissions({ submissions }: { submissions?: any[] }) {
  if (!submissions || submissions.length === 0) return (
    <div className="p-4 bg-white rounded shadow">No recent submissions.</div>
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-medium mb-2">Recent Submissions</h4>
      <ul className="space-y-2">
        {submissions.map((s) => (
          <li key={s.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-gray-500">{s.submittedAt}</div>
            </div>
            <div className="text-sm text-gray-600">{s.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
