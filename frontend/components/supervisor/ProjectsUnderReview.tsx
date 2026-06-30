"use client";
import React from 'react';

export default function ProjectsUnderReview({ projects }: { projects?: any[] }) {
  if (!projects || projects.length === 0) {
    return <div className="p-4 bg-white rounded shadow">No projects under review.</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Projects Under Review</h4>
        <span className="text-xs text-gray-500">{projects.length} active</span>
      </div>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded border border-gray-100 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold">{project.title}</div>
                <div className="text-sm text-gray-500">{project.student} · Due {project.dueDate}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{project.status.replace('_', ' ')}</span>
                <button className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Review</button>
                <button className="rounded border border-gray-200 bg-white px-3 py-1 text-xs">Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
