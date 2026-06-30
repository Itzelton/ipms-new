"use client";
import React from 'react';

export default function ProjectMilestonesPanel({ milestones }: { milestones?: any[] }) {
  if (!milestones || milestones.length === 0) {
    return <div className="p-6 text-gray-600">No milestones defined for this project.</div>;
  }

  return (
    <div className="rounded border border-gray-100 bg-white p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <span className="text-sm text-gray-500">{milestones.length} items</span>
      </div>
      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="rounded-lg border border-gray-200 p-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{milestone.title}</div>
              <p className="text-sm text-gray-500">Due {milestone.dueDate}</p>
            </div>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${milestone.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : milestone.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
              {milestone.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
