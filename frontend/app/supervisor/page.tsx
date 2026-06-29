npm run"use client";
import React from 'react';
import Link from 'next/link';
import AnalyticsSummaryCard from '../../components/supervisor/AnalyticsSummaryCard';
import PendingReviewsCard from '../../components/supervisor/PendingReviewsCard';
import ProjectsUnderReview from '../../components/supervisor/ProjectsUnderReview';
import AssignedStudentsTable from '../../components/supervisor/AssignedStudentsTable';
import RiskAlertsPanel from '../../components/supervisor/RiskAlertsPanel';
import NotificationsPanel from '../../components/dashboard/NotificationsPanel';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import ChatAssistant from '../../components/ai/ChatAssistant';

const fallbackDashboard = {
  assignedStudents: [
    { id: 'stu1', name: 'Amina Patel', project: 'Research Analytics', progress: 74, status: 'ON_TRACK' },
    { id: 'stu2', name: 'Jonas Lee', project: 'Capstone Platform', progress: 49, status: 'AT_RISK' },
  ],
  projectsUnderReview: [
    { id: 'proj1', title: 'Capstone Platform', status: 'REVIEW_PENDING', student: 'Jonas Lee', dueDate: '2026-06-20' },
    { id: 'proj2', title: 'AI Monitoring', status: 'IN_REVIEW', student: 'Amina Patel', dueDate: '2026-06-28' },
  ],
  pendingReviews: [{ id: 'rev1', title: 'Week 7 Progress', student: 'Jonas Lee', dueDate: '2026-06-09' }],
  notifications: [
    { id: 'n1', title: 'Review due today', message: 'Review submission from Amina Patel', createdAt: '2026-06-11' },
  ],
  activityFeed: [
    { id: 'a1', type: 'PROJECT_CREATED' as const, title: 'Project created', detail: 'Amina Patel started a new project', actor: 'Amina Patel', timestamp: '2026-04-01' },
    { id: 'a2', type: 'MILESTONE_COMPLETED' as const, title: 'Prototype milestone completed', detail: 'Jonas Lee completed the prototype milestone', actor: 'Jonas Lee', timestamp: '2026-06-08' },
    { id: 'a3', type: 'SUBMISSION_UPLOADED' as const, title: 'Submission uploaded', detail: 'Amina Patel uploaded Week 7 status update', actor: 'Amina Patel', timestamp: '2026-06-10' },
    { id: 'a4', type: 'COMMENT' as const, title: 'New comment on submission', detail: 'Please address the testing plan concerns', actor: 'Supervisor', timestamp: '2026-06-11' },
    { id: 'a5', type: 'REVISION_REQUEST' as const, title: 'Revision requested', detail: 'Requested revision for prototype evaluation', actor: 'Supervisor', timestamp: '2026-06-11' },
  ],
  riskAlerts: [
    { id: 'r1', title: 'Project delay risk', description: 'Prototype milestone behind schedule for Jonas Lee', status: 'HIGH' },
  ],
  analyticsSummary: {
    activeProjects: 12,
    reviewQueue: 4,
    averageTurnaround: '1.8 days',
    riskProjects: 3,
  },
};

export default function SupervisorIndex() {
  const dashboard = fallbackDashboard;

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
    </div>
  );
}
