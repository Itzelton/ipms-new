"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '../../services/api';
import { useAuth } from '../../components/auth/auth-context';
import ActiveProjectCard from '../../components/dashboard/ActiveProjectCard';
import MilestonesList from '../../components/dashboard/MilestonesList';
import RecentSubmissions from '../../components/dashboard/RecentSubmissions';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import HealthScoreCard from '../../components/dashboard/HealthScoreCard';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';

const YEAR = new Date().getFullYear();

const EMPTY: any = {
  activeProject: null,
  hasActive: false,
  milestones: [],
  recentSubmissions: [],
  notifications: [],
  activity: [],
  healthScore: null,
  heatmap: { year: YEAR, days: [] },
  supervisor: null,
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [projects, submissions, notifications, heatmapRes, meRes] = await Promise.allSettled([
          apiGet('/projects'),
          apiGet('/submissions'),
          apiGet('/notifications'),
          apiGet(`/analytics/heatmap?year=${YEAR}`),
          apiGet('/auth/me'),
        ]);

        const projectList = projects.status === 'fulfilled' && Array.isArray(projects.value) ? projects.value : [];
        const submissionList = submissions.status === 'fulfilled' && Array.isArray(submissions.value) ? submissions.value : [];
        const notificationList = notifications.status === 'fulfilled' && Array.isArray(notifications.value) ? notifications.value : [];

        const activeProject = projectList.find((p: any) => p.status === 'ACTIVE') ?? projectList[0] ?? null;
        const firstProject = activeProject;
        const hasActive = projectList.some((p: any) => p.status === 'ACTIVE');
        const advisorId = meRes.status === 'fulfilled' ? meRes.value?.studentProfile?.advisorId : null;

        // Fetch project details and supervisor in parallel (neither depends on the other)
        const [detailsRes, svRes] = await Promise.allSettled([
          firstProject?.id ? apiGet(`/projects/${firstProject.id}/details`) : Promise.resolve(null),
          advisorId ? apiGet(`/users/${advisorId}`) : Promise.resolve(null),
        ]);

        const details = detailsRes.status === 'fulfilled' ? detailsRes.value : null;
        const milestones: any[] = details?.milestones ?? [];
        const healthScore: any = details?.healthScore ?? null;

        let supervisor: any = null;
        if (svRes.status === 'fulfilled' && svRes.value) {
          const sv = svRes.value;
          supervisor = {
            id: sv.id,
            name: sv.preferredName || [sv.firstName, sv.lastName].filter(Boolean).join(' ') || sv.email,
            email: sv.email,
          };
        }

        if (mounted) {
          setData({
            activeProject: firstProject ? { id: firstProject.id, title: firstProject.title, progress: firstProject.progress ?? 0 } : null,
            hasActive,
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
            heatmap: heatmapRes.status === 'fulfilled' ? heatmapRes.value : { year: YEAR, days: [] },
            supervisor,
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
            <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">Student workspace</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">Track your project, submissions and advisor feedback.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {!loading && !data.hasActive && (
              <Link
                href="/student/projects"
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-sky-700 transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Proposal
              </Link>
            )}
            <div className="flex gap-2 overflow-x-auto pb-0.5 flex-nowrap"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
              {[
                { href: '/student', label: 'Overview' },
                { href: '/student/projects', label: 'Projects' },
                { href: '/student/submissions', label: 'Submissions' },
                { href: '/student/discussions', label: 'Discussions' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-slate-600 no-underline transition hover:text-slate-900"
                  style={{ background: 'rgba(248,250,252,0.80)', border: '1px solid rgba(226,232,240,0.80)' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="p-6 text-slate-500">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Supervisor banner */}
              {data.supervisor ? (
                <div className="card p-5 flex items-center gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100">
                    <svg className="h-5 w-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Your Supervisor</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 truncate">{data.supervisor.name}</p>
                    <p className="text-xs text-slate-500 truncate">{data.supervisor.email}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">Assigned</span>
                </div>
              ) : (
                <div className="card p-5 flex items-center gap-4 border-dashed">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">No supervisor assigned yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">Your administrator will assign a supervisor to your account shortly.</p>
                  </div>
                </div>
              )}
              <ActiveProjectCard project={data.activeProject} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MilestonesList milestones={data.milestones} />
                <div className="space-y-6">
                  <HealthScoreCard score={data.healthScore} />
                </div>
              </div>
              <RecentSubmissions submissions={data.recentSubmissions} />
            </div>

            <aside className="space-y-6">
              <ActivityTimeline items={data.activity} />
            </aside>
          </div>

          <ActivityHeatmap
            days={data.heatmap.days}
            year={data.heatmap.year}
            label="Your activity"
          />
        </>
      )}
    </div>
  );
}
