"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { getProjectDetails } from '../../../../services/project';
import ActivityTimeline from '../../../../components/dashboard/ActivityTimeline';
import ProjectOverviewPanel from '../../../../components/project/ProjectOverviewPanel';
import SupervisorMilestonesPanel from '../../../../components/supervisor/SupervisorMilestonesPanel';
import SupervisorSubmissionsPanel from '../../../../components/supervisor/SupervisorSubmissionsPanel';
import ProjectDiscussionsPanel from '../../../../components/project/ProjectDiscussionsPanel';
import ProjectHealthRiskPanel from '../../../../components/project/ProjectHealthRiskPanel';
import ProjectRecommendationsPanel from '../../../../components/project/ProjectRecommendationsPanel';
import ProjectTabs from '../../../../components/project/ProjectTabs';
import ProjectCollaboratorsPanel from '../../../../components/project/ProjectCollaboratorsPanel';
import ActivityHeatmap from '../../../../components/dashboard/ActivityHeatmap';
import { apiGet } from '../../../../services/api';
import { useAuth } from '../../../../components/auth/auth-context';
import Breadcrumb from '../../../../components/ui/Breadcrumb';
import Link from 'next/link';
import ProposalReviewPanel from '../../../../components/supervisor/ProposalReviewPanel';

export default function SupervisorProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<{ year: number; days: any[] }>({ year: new Date().getFullYear(), days: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const loadProject = useCallback(() => {
    let mounted = true;
    setLoading(true);
    setLoadError('');
    const year = new Date().getFullYear();
    Promise.allSettled([
      getProjectDetails(params.projectId),
      apiGet(`/analytics/projects/${params.projectId}/heatmap?year=${year}`),
    ]).then(([detailsRes, heatmapRes]) => {
      if (!mounted) return;
      if (detailsRes.status === 'fulfilled' && detailsRes.value) setProject(detailsRes.value);
      else setLoadError('We could not load this project. It may have been removed or you may no longer have access.');
      if (heatmapRes.status === 'fulfilled') setHeatmap(heatmapRes.value);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [params.projectId]);

  useEffect(() => loadProject(), [loadProject]);

  if (loading) return <div className="p-6">Loading project details...</div>;
  if (!project) return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <h1 className="text-lg font-semibold text-slate-800">Project unavailable</h1>
      <p className="mt-2 text-sm text-slate-500">{loadError || 'This project could not be found.'}</p>
      <div className="mt-5 flex justify-center gap-3">
        <button onClick={loadProject} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>
        <Link href="/supervisor/projects" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 no-underline">Back to projects</Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="card-static p-6">
        <Breadcrumb crumbs={[
          { label: 'Dashboard', href: '/supervisor' },
          { label: 'Projects', href: '/supervisor/projects' },
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
            <span className="rounded-full bg-violet-100 px-3 py-1 text-[12px] font-semibold text-violet-700">
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

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          {project.status === 'PROPOSED' && (
            <ProposalReviewPanel project={project} onStatusChange={(status) => setProject((current: any) => ({ ...current, status }))} />
          )}
          <ProjectOverviewPanel project={project} />
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-6 pt-5 pb-0">
              <ProjectTabs activeTab={activeTab} onChange={setActiveTab} />
            </div>
            <div className="space-y-5 p-6">
              {activeTab === 'overview' && (
                <>
                  <SupervisorMilestonesPanel projectId={params.projectId} milestones={project.milestones} />
                  <SupervisorSubmissionsPanel submissions={project.submissions} />
                  <ProjectDiscussionsPanel discussions={project.discussionThreads ?? project.discussions} />
                  <ActivityHeatmap days={heatmap.days} year={heatmap.year} label="Project activity" />
                </>
              )}
              {activeTab === 'milestones'    && <SupervisorMilestonesPanel projectId={params.projectId} milestones={project.milestones} />}
              {activeTab === 'submissions'   && <SupervisorSubmissionsPanel submissions={project.submissions} />}
              {activeTab === 'discussions'   && <ProjectDiscussionsPanel discussions={project.discussionThreads ?? project.discussions} />}
              {activeTab === 'collaborators' && <ProjectCollaboratorsPanel projectId={params.projectId} />}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <ProjectHealthRiskPanel healthScore={project.healthScore} riskStatus={project.riskStatus} analytics={project.analytics} />
          <ProjectRecommendationsPanel recommendations={project.recommendedActions} />
          <ActivityTimeline items={project.activity} />
        </aside>
      </div>
    </div>
  );
}
