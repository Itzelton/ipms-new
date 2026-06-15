"use client";
import React, { useEffect, useState } from 'react';
import ActiveProjectCard from '../../components/dashboard/ActiveProjectCard';
import MilestonesList from '../../components/dashboard/MilestonesList';
import RecentSubmissions from '../../components/dashboard/RecentSubmissions';
import NotificationsPanel from '../../components/dashboard/NotificationsPanel';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import HealthScoreCard from '../../components/dashboard/HealthScoreCard';
import AIInsightsCard from '../../components/dashboard/AIInsightsCard';
import ChatAssistant from '../../components/ai/ChatAssistant';
import { getStudentDashboard } from '../../services/student';



export default function StudentDashboard() {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    getStudentDashboard().then((d) => {
      if (mounted) setData(d);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  if (!data) return <div className="p-6 text-gray-600">No dashboard data available.</div>;

  return (
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
  );
}

