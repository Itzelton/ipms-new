"use client";
import React, { useEffect, useState } from 'react';
import { getProjectDetails } from '../../../../services/project';
import ActivityTimeline from '../../../../components/dashboard/ActivityTimeline';
import ProjectOverviewPanel from '../../../../components/project/ProjectOverviewPanel';
import ProjectMilestonesPanel from '../../../../components/project/ProjectMilestonesPanel';
import ProjectSubmissionsPanel from '../../../../components/project/ProjectSubmissionsPanel';
import ProjectDiscussionsPanel from '../../../../components/project/ProjectDiscussionsPanel';
import ProjectHealthRiskPanel from '../../../../components/project/ProjectHealthRiskPanel';
import ProjectRecommendationsPanel from '../../../../components/project/ProjectRecommendationsPanel';
import ProjectTabs from '../../../../components/project/ProjectTabs';
import ProjectCollaboratorsPanel from '../../../../components/project/ProjectCollaboratorsPanel';
import ActivityHeatmap from '../../../../components/dashboard/ActivityHeatmap';
import { apiGet } from '../../../../services/api';
import { useAuth } from '../../../../components/auth/auth-context';
import Breadcrumb from '../../../../components/ui/Breadcrumb';

export default function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<{ year: number; days: any[] }>({ year: new Date().getFullYear(), days: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let mounted = true;
    const year = new Date().getFullYear();
    Promise.allSettled([
      getProjectDetails(params.projectId),
      apiGet(`/analytics/projects/${params.projectId}/heatmap?year=${year}`),
    ]).then(([detailsRes, heatmapRes]) => {
      if (!mounted) return;
      if (detailsRes.status === 'fulfilled') setProject(detailsRes.value);
      if (heatmapRes.status === 'fulfilled') setHeatmap(heatmapRes.value);
    })
      .catch(() => {
        if (mounted) setProject({
          id: params.projectId,
          title: 'Capstone Project',
          description: 'Your capstone project for the current semester.',
          status: 'ACTIVE',
          dueDate: '2026-07-30',
          milestones: [],
          submissions: [],
          discussions: [],
          healthScore: null,
          riskStatus: null,
          analytics: null,
          recommendedActions: [],
          activity: [],
        });
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [params.projectId]);

  if (loading) return <div className="p-6">Loading project details...</div>;
  if (!project) return <div className="p-6 text-gray-600">Project not found.</div>;

  return (
    <div className="space-y-6">
      <header className="card-static p-6">
        <Breadcrumb crumbs={[
          { label: 'Dashboard', href: '/student' },
          { label: 'Projects', href: '/student/projects' },
          { label: project.title },
        ]} />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{project.title}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-slate-500 max-w-2xl">{project.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-[12px] font-semibold text-sky-700">
              {(project.status ?? '').replace(/_/g, ' ')}
            </span>
            {project.dueDate && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] text-slate-600">
                Due {project.dueDate}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <ProjectOverviewPanel project={project} />
          <div className="card p-6">
            <ProjectTabs activeTab={activeTab} onChange={setActiveTab} />
            <div className="mt-6 space-y-6">
              {activeTab === 'overview' && (
                <>
                  <ProjectMilestonesPanel milestones={project.milestones} projectId={params.projectId} />
                  <ProjectSubmissionsPanel submissions={project.submissions} projectId={params.projectId} />
                  <ProjectDiscussionsPanel discussions={project.discussionThreads ?? project.discussions} />
                  <ActivityHeatmap days={heatmap.days} year={heatmap.year} label="Project activity" />
                </>
              )}
              {activeTab === 'milestones' && <ProjectMilestonesPanel milestones={project.milestones} projectId={params.projectId} />}
              {activeTab === 'submissions' && <ProjectSubmissionsPanel submissions={project.submissions} />}
              {activeTab === 'discussions' && <ProjectDiscussionsPanel discussions={project.discussionThreads ?? project.discussions} />}
              {activeTab === 'collaborators' && <ProjectCollaboratorsPanel projectId={params.projectId} />}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <ProjectHealthRiskPanel healthScore={project.healthScore} riskStatus={project.riskStatus} analytics={project.analytics} />
          <ProjectRecommendationsPanel recommendations={project.recommendedActions} />
          <ActivityTimeline items={project.activity} />
        </aside>
      </div>
    </div>
  );
}
