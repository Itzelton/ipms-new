"use client";
import React from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectList({ projects, role = 'STUDENT' }: { projects: any[]; role?: string }) {
  if (!projects || projects.length === 0) return <div className="text-gray-600">No projects found.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} role={role} />
      ))}
    </div>
  );
}
