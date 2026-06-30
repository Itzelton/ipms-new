"use client";
import React, { useEffect, useState } from 'react';
import { getProjectsForUser } from '../../../services/project';
import ProjectList from '../../../components/project/ProjectList';

const fallbackProjects = [
  { id: 'p1', title: 'Capstone Project', student: 'You', progress: 62, status: 'ON_TRACK' },
];

export default function StudentProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    getProjectsForUser('STUDENT')
      .then((p) => { if (mounted) setProjects(p); })
      .catch(() => { if (mounted) setProjects(fallbackProjects); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-2xl font-semibold text-slate-900">Your Projects</h3>
        <p className="mt-2 text-slate-600">Track your active project submissions and progress.</p>
      </div>
      {loading && <div className="text-slate-500">Loading projects...</div>}
      {!loading && <ProjectList projects={projects ?? fallbackProjects} role="STUDENT" />}
    </div>
  );
}
