"use client";
import React, { useEffect, useState } from 'react';
import { getSupervisorDashboard } from '../../services/supervisor';
import AssignedStudentsTable from '../../components/supervisor/AssignedStudentsTable';
import ProjectsUnderReview from '../../components/supervisor/ProjectsUnderReview';
import PendingReviewsCard from '../../components/supervisor/PendingReviewsCard';
import RiskAlertsPanel from '../../components/supervisor/RiskAlertsPanel';
import AnalyticsSummaryCard from '../../components/supervisor/AnalyticsSummaryCard';
import NotificationsPanel from '../../components/dashboard/NotificationsPanel';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import ChatAssistant from '../../components/ai/ChatAssistant';

export default function SupervisorIndex() {
  const [dashboard, setDashboard] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSupervisorDashboard()
      .then((data) => { if (mounted) setDashboard(data); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading supervisor dashboard...</div>;
  if (!dashboard) return <div className="p-6 text-gray-600">Unable to load dashboard data.</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Supervisor Dashboard</h2>
          <p className="text-gray-600">Monitor assigned students, reviews and project risk.</p>
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
          <ChatAssistant role="SUPERVISOR" projectId={dashboard?.activeProject?.id} />
        </aside>

      </div>
    </div>
  );
}
