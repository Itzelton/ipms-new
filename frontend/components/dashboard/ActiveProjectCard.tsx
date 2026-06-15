"use client";
import React from 'react';

export default function ActiveProjectCard({ project }: { project: any }) {
  if (!project) return (
    <div className="p-4 bg-white rounded shadow">No active project</div>
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="text-sm text-gray-600">Active project</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-xl font-bold">{project.progress}%</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div style={{ width: `${project.progress}%` }} className="h-2 bg-blue-600" />
        </div>
      </div>
    </div>
  );
}
