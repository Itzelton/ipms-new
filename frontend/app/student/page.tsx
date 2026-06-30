"use client";
import React from 'react';
import Link from 'next/link';
import ActiveProjectCard from '../../components/dashboard/ActiveProjectCard';
import MilestonesList from '../../components/dashboard/MilestonesList';
import RecentSubmissions from '../../components/dashboard/RecentSubmissions';
import NotificationsPanel from '../../components/dashboard/NotificationsPanel';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import HealthScoreCard from '../../components/dashboard/HealthScoreCard';
import AIInsightsCard from '../../components/dashboard/AIInsightsCard';
import ChatAssistant from '../../components/ai/ChatAssistant';

const fallbackData = {
  activeProject: { id: 'p1', title: 'Capstone Project', progress: 62 },
  milestones: [
    { id: 'm1', title: 'Proposal', status: 'COMPLETED' as const, dueDate: '2026-05-01' },
    { id: 'm2', title: 'Prototype', status: 'IN_PROGRESS' as const, dueDate: '2026-06-15' },
    { id: 'm3', title: 'Final Report', status: 'PENDING' as const, dueDate: '2026-07-30' },
  ],
  recentSubmissions: [
    { id: 's1', title: 'Week 6 Update', submittedAt: '2026-06-05', status: 'REVIEWED' as const },
  ],
  notifications: [
    { id: 'n1', title: 'Supervisor feedback', message: 'Please revise section 2', createdAt: '2026-06-06' },
  ],
  activity: [
    { id: 'a1', type: 'PROJECT_CREATED' as const, title: 'Project created', detail: 'Capstone Project was created by your supervisor', actor: 'Dr. Sofia Khan', timestamp: '2026-04-01' },
    { id: 'a2', type: 'MILESTONE_COMPLETED' as const, title: 'Proposal milestone completed', detail: 'Student completed the proposal milestone', actor: 'You', timestamp: '2026-05-01' },
    { id: 'a3', type: 'SUBMISSION_UPLOADED' as const, title: 'Submission uploaded: Week 6 Update', detail: 'Your progress report was uploaded for review', actor: 'You', timestamp: '2026-06-05' },
    { id: 'a4', type: 'COMMENT' as const, title: 'Supervisor comment received', detail: 'Please revisit the user personas section', actor: 'Dr. Sofia Khan', timestamp: '2026-06-06' },
    { id: 'a5', type: 'REVISION_REQUEST' as const, title: 'Revision requested', detail: 'Supervisor requested changes to section 2', actor: 'Dr. Sofia Khan', timestamp: '2026-06-06' },
  ],
  healthScore: {
    score: 78,
    category: 'Stable' as const,
    color: 'bg-yellow-100 text-yellow-800',
    trend: 'Stable',
    breakdown: {
      milestoneCompletion: 80,
      deadlineCompliance: 72,
      submissionConsistency: 75,
      supervisorEngagement: 65,
      projectActivity: 70,
    },
  },
  aiInsights: [
    { id: 'ai1', title: 'Risk: Delayed prototype', summary: 'Prototype milestone behind schedule' },
  ],
};

export default function StudentDashboard() {
  const data = fallbackData;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActiveProjectCard project={data.activeProject} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MilestonesList milestones={data.milestones} />
            <div className="space-y-6">
              <HealthScoreCard score={data.healthScore} />
              <AIInsightsCard insights={data.aiInsights} />
              <ChatAssistant role="STUDENT" projectId={data?.activeProject?.id} />
            </div>
          </div>
          <RecentSubmissions submissions={data.recentSubmissions} />
        </div>

        <aside className="space-y-6">
          <NotificationsPanel notifications={data.notifications} />
          <ActivityTimeline items={data.activity} />
        </aside>
      </div>
    </div>
  );
}
