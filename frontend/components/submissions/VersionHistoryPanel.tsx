"use client";
import React from 'react';

export default function VersionHistoryPanel({ versions }: { versions?: any[] }) {
  if (!versions || versions.length === 0) {
    return <div className="rounded bg-white p-6 shadow">Select a submission to view version history.</div>;
  }

  return (
    <div className="rounded bg-white p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Version History</h3>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{versions.length} versions</span>
      </div>
      <div className="space-y-3">
        {versions.map((version) => (
          <div key={version.id} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">Version {version.versionNumber}</div>
                <div className="text-sm text-gray-500">{new Date(version.createdAt).toLocaleDateString()}</div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{version.evidenceType || 'Evidence'}</span>
            </div>
            {version.metadata?.title && <div className="mt-3 text-sm text-gray-700">{version.metadata.title}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
