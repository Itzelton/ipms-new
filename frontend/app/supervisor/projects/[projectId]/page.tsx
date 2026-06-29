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

export default function SupervisorProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let mounted = true;
    getProjectDetails(params.projectId)
      .then((data) => { if (mounted) setProject(data); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [params.projectId]);

  if (loading) return <div className="p-6">Loading project details...</div>;
  if (!project) return <div className="p-6 text-gray-600">Project not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{project.title}</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{project.status}</span>
          <span className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700">Due {project.dueDate}</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <ProjectOverviewPanel project={project} />
          <div className="bg-white rounded shadow p-4">
            <ProjectTabs activeTab={activeTab} onChange={setActiveTab} />
            <div className="mt-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <ProjectMilestonesPanel milestones={project.milestones} />
                  <ProjectSubmissionsPanel submissions={project.submissions} />
                  <ProjectDiscussionsPanel discussions={project.discussions} />
                </div>
              )}
              {activeTab === 'milestones' && <ProjectMilestonesPanel milestones={project.milestones} />}
              {activeTab === 'submissions' && <ProjectSubmissionsPanel submissions={project.submissions} />}
              {activeTab === 'discussions' && <ProjectDiscussionsPanel discussions={project.discussions} />}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <ProjectHealthRiskPanel healthScore={project.healthScore} riskStatus={project.riskStatus} analytics={project.analytics} />
          <ProjectRecommendationsPanel recommendations={project.recommendedActions} />
          <div className="bg-white rounded shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <ActivityTimeline items={project.activity} />
          </div>
        </aside>
      </div>
    </div>
  );
}
