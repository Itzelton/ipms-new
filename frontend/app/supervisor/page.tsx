"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '../../services/api';
import AnalyticsSummaryCard from '../../components/supervisor/AnalyticsSummaryCard';
import PendingReviewsCard from '../../components/supervisor/PendingReviewsCard';
import ProjectsUnderReview from '../../components/supervisor/ProjectsUnderReview';
import AssignedStudentsTable from '../../components/supervisor/AssignedStudentsTable';
import RiskAlertsPanel from '../../components/supervisor/RiskAlertsPanel';
import NotificationsPanel from '../../components/dashboard/NotificationsPanel';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import ChatAssistant from '../../components/ai/ChatAssistant';

const EMPTY: any = {
  assignedStudents: [],
  projectsUnderReview: [],
  pendingReviews: [],
  notifications: [],
  activityFeed: [],
  riskAlerts: [],
  analyticsSummary: { activeProjects: 0, reviewQueue: 0, averageTurnaround: '—', riskProjects: 0 },
};

export default function SupervisorIndex() {
  const [dashboard, setDashboard] = useState<any>(EMPTY);
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

        const underReview = projectList.filter((p: any) => ['REVIEW_PENDING', 'IN_REVIEW', 'ACTIVE'].includes(p.status));
        const pendingReviews = submissionList
          .filter((s: any) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW')
          .slice(0, 5)
          .map((s: any) => ({ id: s.id, title: s.metadata?.title || `Submission ${s.id.slice(0, 6)}`, student: s.author?.firstName || s.author?.email || '—', dueDate: s.updatedAt }));

        const students = projectList
          .filter((p: any) => p.student)
          .map((p: any) => {
            const name = typeof p.student === 'string' ? p.student : [p.student?.firstName, p.student?.lastName].filter(Boolean).join(' ') || p.student?.email || '—';
            return { id: p.student?.id || p.id, name, project: p.title, progress: p.progress ?? 0, status: p.status };
          });

        if (mounted) {
          setDashboard({
            assignedStudents: students.slice(0, 10),
            projectsUnderReview: underReview.slice(0, 5).map((p: any) => ({ id: p.id, title: p.title, status: p.status, student: typeof p.student === 'string' ? p.student : p.student?.email || '—', dueDate: p.dueDate })),
            pendingReviews,
            notifications: notificationList.slice(0, 5).map((n: any) => ({ id: n.id, title: n.title, message: n.message, createdAt: n.createdAt })),
            activityFeed: [],
            riskAlerts: [],
            analyticsSummary: {
              activeProjects: projectList.filter((p: any) => p.status === 'ACTIVE').length,
              reviewQueue: pendingReviews.length,
              averageTurnaround: '—',
              riskProjects: projectList.filter((p: any) => p.status === 'AT_RISK').length,
            },
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
          <div className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">Supervisor workspace</div>
          <h2 className="text-3xl font-semibold text-slate-900">Supervisor Dashboard</h2>
          <p className="text-slate-600">Monitor assigned students, reviews, discussions and project risks with clear status cards.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Link href="/supervisor/projects" className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Projects</Link>
          <Link href="/supervisor/reviews" className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Reviews</Link>
          <Link href="/supervisor/discussions" className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Discussions</Link>
          <Link href="/supervisor/settings" className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Settings</Link>
        </div>
      </header>

      {loading ? (
        <div className="p-6 text-slate-500">Loading dashboard...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <PendingReviewsCard pendingReviews={dashboard.pendingReviews} />
              <RiskAlertsPanel alerts={dashboard.riskAlerts} />
            </div>
            <AnalyticsSummaryCard summary={dashboard.analyticsSummary} />
            <ProjectsUnderReview projects={dashboard.projectsUnderReview} />
            <AssignedStudentsTable students={dashboard.assignedStudents} />
          </div>

          <aside className="space-y-6">
            <NotificationsPanel notifications={dashboard.notifications} />
            <ActivityTimeline items={dashboard.activityFeed} />
            <ChatAssistant role="SUPERVISOR" />
          </aside>
        </div>
      )}
    </div>
  );
}
