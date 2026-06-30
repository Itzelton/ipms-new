"use client";
import React from 'react';
import Link from 'next/link';

export default function ProjectCard({ project, role = 'STUDENT' }: { project: any; role?: string }) {
  const href = role === 'SUPERVISOR' ? `/supervisor/projects/${project.id}` : `/student/projects/${project.id}`;

  return (
    <Link href={href} className="block p-4 bg-white rounded shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{project.title}</h4>
          <div className="text-sm text-gray-500">{project.status}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="font-bold">{project.progress}%</div>
        </div>
      </div>
      <div className="mt-3 h-2 bg-gray-200 rounded overflow-hidden">
        <div style={{ width: `${project.progress}%` }} className="h-2 bg-blue-600" />
      </div>
    </Link>
  );
}
