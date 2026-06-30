"use client";
import React from 'react';

export default function ProjectDiscussionsPanel({ discussions }: { discussions?: any[] }) {
  if (!discussions || discussions.length === 0) {
    return <div className="p-6 text-gray-600">No discussion threads yet.</div>;
  }

  return (
    <div className="rounded border border-gray-100 bg-white p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Discussion Threads</h3>
        <span className="text-sm text-gray-500">{discussions.length} threads</span>
      </div>
      <div className="space-y-3">
        {discussions.map((thread) => (
          <div key={thread.id} className="rounded-lg border border-gray-200 p-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{thread.title}</div>
              <p className="text-sm text-gray-500">Updated {thread.updatedAt} · {thread.messages} messages</p>
            </div>
            <button className="mt-3 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white sm:mt-0">Open thread</button>
          </div>
        ))}
      </div>
    </div>
  );
}
