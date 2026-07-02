"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '../../services/api';
import ActiveProjectCard from '../../components/dashboard/ActiveProjectCard';
import MilestonesList from '../../components/dashboard/MilestonesList';
import RecentSubmissions from '../../components/dashboard/RecentSubmissions';
import NotificationsPanel from '../../components/dashboard/NotificationsPanel';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import HealthScoreCard from '../../components/dashboard/HealthScoreCard';
import AIInsightsCard from '../../components/dashboard/AIInsightsCard';
import ChatAssistant from '../../components/ai/ChatAssistant';

const EMPTY: any = {
  activeProject: null,
  milestones: [],
  recentSubmissions: [],
  notifications: [],
  activity: [],
  healthScore: null,
  aiInsights: [],
};

export default function StudentDashboard() {
  const [data, setData] = useState<any>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [projects, submissions, notifications] = await Promise.allSettled([
          apiGet('/projects'),
          apiGet('/submissions'),
          apiGet('/notifications'),
        ]);

        const projectList = projects.status === 'fulfilled' && Array.isArray(projects.value) ? projects.value : [];
        const submissionList = submissions.status === 'fulfilled' && Array.isArray(submissions.value) ? submissions.value : [];
        const notificationList = notifications.status === 'fulfilled' && Array.isArray(notifications.value) ? notifications.value : [];

        const firstProject = projectList[0] ?? null;
        let milestones: any[] = [];
        let healthScore: any = null;

        if (firstProject?.id) {
          try {
            const details = await apiGet(`/projects/${firstProject.id}/details`);
            milestones = details?.milestones ?? [];
            healthScore = details?.healthScore ?? null;
          } catch { /* leave empty */ }
        }

        if (mounted) {
          setData({
            activeProject: firstProject ? { id: firstProject.id, title: firstProject.title, progress: firstProject.progress ?? 0 } : null,
            milestones,
            recentSubmissions: submissionList.slice(0, 5).map((s: any) => ({
              id: s.id,
              title: s.metadata?.title || `Submission ${s.id.slice(0, 6)}`,
              submittedAt: s.submittedAt ?? s.createdAt,
              status: s.status,
            })),
            notifications: notificationList.slice(0, 5).map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              createdAt: n.createdAt,
            })),
            activity: [],
            healthScore,
            aiInsights: [],
          });
        }
      } catch {
        // leave empty state
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <header className="card p-6 space-y-4">
        <div className="space-y-2">
          <div className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">Student view</div>
          <h2 className="text-3xl font-semibold text-slate-900">Student Dashboard</h2>
          <p className="mt-2 text-slate-600">Track your active project, submissions and advisor feedback in one friendly workspace.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Link href="/student" className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Dashboard</Link>
          <Link href="/student/projects" className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Projects</Link>
          <Link href="/student/submissions" className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Submissions</Link>
          <Link href="/student/discussions" className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Discussions</Link>
        </div>
      </header>

      {loading ? (
        <div className="p-6 text-slate-500">Loading dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ActiveProjectCard project={data.activeProject} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MilestonesList milestones={data.milestones} />
              <div className="space-y-6">
                <HealthScoreCard score={data.healthScore} />
                <AIInsightsCard insights={data.aiInsights} />
                <ChatAssistant role="STUDENT" projectId={data.activeProject?.id} />
              </div>
            </div>
            <RecentSubmissions submissions={data.recentSubmissions} />
          </div>

          <aside className="space-y-6">
            <NotificationsPanel notifications={data.notifications} />
            <ActivityTimeline items={data.activity} />
          </aside>
        </div>
      )}
    </div>
  );
}
