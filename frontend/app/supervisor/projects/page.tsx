"use client";
import React, { useEffect, useState } from 'react';
import { getProjectsForUser } from '../../../services/project';
import ProjectList from '../../../components/project/ProjectList';

const fallbackProjects = [
  { id: 'p1', title: 'Research Analytics Platform', student: 'Amina Patel', progress: 74, status: 'ON_TRACK' },
  { id: 'p2', title: 'Capstone Dashboard', student: 'Jonas Lee', progress: 49, status: 'AT_RISK' },
  { id: 'p3', title: 'AI Monitoring System', student: 'Kofi Mensah', progress: 88, status: 'ON_TRACK' },
];

export default function SupervisorProjectsPage() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    getProjectsForUser('SUPERVISOR')
      .then((p) => { if (mounted) setProjects(p); })
      .catch(() => { if (mounted) setProjects(fallbackProjects); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-2xl font-semibold text-slate-900">Projects</h3>
        <p className="mt-2 text-slate-600">Monitor all projects assigned to you.</p>
      </div>
      {loading && <div className="text-slate-500">Loading projects...</div>}
      {!loading && <ProjectList projects={projects ?? fallbackProjects} role="SUPERVISOR" />}
    </div>
  );
}
