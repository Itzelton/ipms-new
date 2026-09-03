"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../components/auth/auth-context';
import Link from 'next/link';
import { apiGet } from '../../services/api';
import AnalyticsSummaryCard from '../../components/supervisor/AnalyticsSummaryCard';
import PendingReviewsCard from '../../components/supervisor/PendingReviewsCard';
import ProjectsUnderReview from '../../components/supervisor/ProjectsUnderReview';
import AssignedStudentsTable from '../../components/supervisor/AssignedStudentsTable';
import RiskAlertsPanel from '../../components/supervisor/RiskAlertsPanel';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import PendingProposalsCard from '../../components/supervisor/PendingProposalsCard';
import { SkeletonDashboard } from '../../components/ui/Skeleton';

const YEAR = new Date().getFullYear();

const EMPTY: any = {
  assignedStudents: [],
  projectsUnderReview: [],
  pendingReviews: [],
  notifications: [],
  activityFeed: [],
  riskAlerts: [],
  analyticsSummary: { activeProjects: 0, reviewQueue: 0, averageTurnaround: '—', riskProjects: 0 },
  heatmap: { year: YEAR, days: [] },
};

export default function SupervisorIndex() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [projects, submissions, notifications, heatmapRes, myStudentsRes, auditRes] = await Promise.allSettled([
          apiGet('/projects'),
          apiGet('/submissions'),
          apiGet('/notifications'),
          apiGet(`/analytics/heatmap?year=${YEAR}`),
          apiGet('/users/my-students'),
          apiGet('/audit?limit=10'),
        ]);

        const projectList = projects.status === 'fulfilled' && Array.isArray(projects.value) ? projects.value : [];
        const submissionList = submissions.status === 'fulfilled' && Array.isArray(submissions.value) ? submissions.value : [];
        const notificationList = notifications.status === 'fulfilled' && Array.isArray(notifications.value) ? notifications.value : [];
        const myStudentsList = myStudentsRes.status === 'fulfilled' && Array.isArray(myStudentsRes.value) ? myStudentsRes.value : [];
        const auditList = auditRes.status === 'fulfilled' && Array.isArray(auditRes.value) ? auditRes.value : [];

        const activityFeed = auditList.slice(0, 8).map((a: any) => ({
          id: a.id,
          type: a.action ?? 'ACTIVITY',
          title: `${(a.action ?? '').replace(/_/g, ' ')}${a.entity ? ` — ${a.entity}` : ''}`,
          detail: a.details ?? '',
          actor: a.actor
            ? (a.actor.preferredName || [a.actor.firstName, a.actor.lastName].filter(Boolean).join(' ') || a.actor.email)
            : 'System',
          timestamp: a.createdAt,
        }));

        const riskAlerts = projectList
          .filter((p: any) => p.status === 'AT_RISK' || p.riskSignals?.some((r: any) => r.severity === 'CRITICAL' || r.severity === 'HIGH'))
          .map((p: any) => ({
            id: p.id,
            title: `Risk: ${p.title}`,
            description: p.riskNote || `Project is at risk — review required`,
            status: 'HIGH',
          }));

        const reviewed = submissionList.filter((s: any) =>
          (s.status === 'APPROVED' || s.status === 'REVISION_REQUIRED') && s.submittedAt && s.updatedAt
        );
        let averageTurnaround = '—';
        if (reviewed.length > 0) {
          const avgMs = reviewed.reduce((sum: number, s: any) => {
            const diff = new Date(s.updatedAt).getTime() - new Date(s.submittedAt).getTime();
            return sum + (diff > 0 ? diff : 0);
          }, 0) / reviewed.length;
          const avgHours = Math.round(avgMs / (1000 * 60 * 60));
          averageTurnaround = avgHours < 24 ? `${avgHours}h` : `${Math.round(avgHours / 24)}d`;
        }

        const underReview = projectList.filter((p: any) => ['REVIEW_PENDING', 'IN_REVIEW', 'ACTIVE'].includes(p.status));
        const pendingReviews = submissionList
          .filter((s: any) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW')
          .slice(0, 5)
          .map((s: any) => ({ id: s.id, title: s.metadata?.title || `Submission ${s.id.slice(0, 6)}`, student: s.author?.firstName || s.author?.email || '—', dueDate: s.updatedAt }));

        // Build students list from assigned students endpoint (includes those without projects)
        const studentsFromAssignment = myStudentsList.map((s: any) => {
          const name = [s.firstName, s.lastName].filter(Boolean).join(' ') || s.preferredName || s.email || '—';
          const proj = s.projects?.[0];
          return { id: s.id, name, project: proj?.title || '(No project yet)', progress: proj ? 0 : null, status: proj?.status || null };
        });

        // Merge with project list (project list may have progress info)
        const studentIdsFromAssignment = new Set(studentsFromAssignment.map((s: any) => s.id));
        const studentsFromProjects = projectList
          .filter((p: any) => p.student && !studentIdsFromAssignment.has(p.student?.id))
          .map((p: any) => {
            const name = typeof p.student === 'string' ? p.student : [p.student?.firstName, p.student?.lastName].filter(Boolean).join(' ') || p.student?.email || '—';
            return { id: p.student?.id || p.id, name, project: p.title, progress: p.progress ?? 0, status: p.status };
          });

        const students = [...studentsFromAssignment, ...studentsFromProjects];

        if (mounted) {
          setDashboard({
            assignedStudents: students.slice(0, 10),
            projectsUnderReview: underReview.slice(0, 5).map((p: any) => ({ id: p.id, title: p.title, status: p.status, student: typeof p.student === 'string' ? p.student : p.student?.email || '—', dueDate: p.dueDate })),
            pendingReviews,
            notifications: notificationList.slice(0, 5).map((n: any) => ({ id: n.id, title: n.title, message: n.message, createdAt: n.createdAt })),
            activityFeed,
            riskAlerts,
            analyticsSummary: {
              activeProjects: projectList.filter((p: any) => p.status === 'ACTIVE').length,
              reviewQueue: pendingReviews.length,
              averageTurnaround,
              riskProjects: projectList.filter((p: any) => p.status === 'AT_RISK').length,
            },
            heatmap: heatmapRes.status === 'fulfilled' ? heatmapRes.value : { year: YEAR, days: [] },
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
      <header className="card-static p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">Supervisor workspace</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">Monitor students, reviews, discussions and project risks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/supervisor', label: 'Overview' },
              { href: '/supervisor/projects', label: 'Projects' },
              { href: '/supervisor/reviews', label: 'Reviews' },
              { href: '/supervisor/discussions', label: 'Discussions' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[12px] font-medium text-slate-600 no-underline transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <SkeletonDashboard />
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
            <PendingProposalsCard />
            <ActivityTimeline items={dashboard.activityFeed} />
          </aside>
        </div>
      )}

      {!loading && (
        <ActivityHeatmap
          days={dashboard.heatmap.days}
          year={dashboard.heatmap.year}
          label="Your activity"
        />
      )}
    </div>
  );
}
