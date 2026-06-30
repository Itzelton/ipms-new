"use client";
import React from 'react';

export default function ProjectOverviewPanel({ project }: { project: any }) {
  return (
    <div className="grid gap-6 rounded bg-white p-6 shadow sm:grid-cols-2">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Project Overview</h3>
          <p className="text-sm text-gray-600">Key milestones, submissions and status in one place.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Student</div>
            <div className="mt-2 font-semibold">{project.student}</div>
          </div>
          <div className="rounded border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Supervisor</div>
            <div className="mt-2 font-semibold">{project.supervisor}</div>
          </div>
          <div className="rounded border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Start Date</div>
            <div className="mt-2 font-semibold">{project.startDate}</div>
          </div>
          <div className="rounded border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Due Date</div>
            <div className="mt-2 font-semibold">{project.dueDate}</div>
          </div>
        </div>
      </div>
      <div className="rounded border border-gray-100 p-4 bg-slate-50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Progress</span>
          <span className="text-sm font-semibold">{project.progress}%</span>
        </div>
        <div className="mt-4 h-3 rounded-full bg-gray-200 overflow-hidden">
          <div style={{ width: `${project.progress}%` }} className="h-full bg-blue-600" />
        </div>
      </div>
    </div>
  );
}
