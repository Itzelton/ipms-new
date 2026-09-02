"use client";
import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../services/api';

function fmtDuration(ms: number) {
  const hours = Math.round(ms / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function pct(n: number, total: number) {
  if (!total) return '—';
  return `${Math.round((n / total) * 100)}%`;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<{
    completionRate: string;
    avgResponseTime: string;
    activeDiscussions: number | string;
    totalProjects: number;
    completedProjects: number;
    activeProjects: number;
    atRiskProjects: number;
    totalSubmissions: number;
    approvedSubmissions: number;
    pendingSubmissions: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [projectsRes, submissionsRes, discussionsRes] = await Promise.allSettled([
          apiGet('/projects'),
          apiGet('/submissions'),
          apiGet('/discussions'),
        ]);

        const projects: any[] = projectsRes.status === 'fulfilled' && Array.isArray(projectsRes.value) ? projectsRes.value : [];
        const submissions: any[] = submissionsRes.status === 'fulfilled' && Array.isArray(submissionsRes.value) ? submissionsRes.value : [];
        const discussions: any[] = discussionsRes.status === 'fulfilled' && Array.isArray(discussionsRes.value) ? discussionsRes.value : [];

        const totalProjects = projects.length;
        const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;
        const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
        const atRiskProjects = projects.filter((p: any) => p.status === 'AT_RISK').length;

        const totalSubmissions = submissions.length;
        const approvedSubmissions = submissions.filter((s: any) => s.status === 'APPROVED').length;
        const pendingSubmissions = submissions.filter((s: any) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length;

        const reviewed = submissions.filter((s: any) =>
          (s.status === 'APPROVED' || s.status === 'REVISION_REQUIRED') && s.submittedAt && s.updatedAt
        );
        let avgResponseTime = '—';
        if (reviewed.length > 0) {
          const avgMs = reviewed.reduce((sum: number, s: any) => {
            const diff = new Date(s.updatedAt).getTime() - new Date(s.submittedAt).getTime();
            return sum + (diff > 0 ? diff : 0);
          }, 0) / reviewed.length;
          avgResponseTime = fmtDuration(avgMs);
        }

        const activeDiscussions = discussions.filter((d: any) => !d.resolved && !d.closedAt).length || discussions.length;

        if (mounted) {
          setData({
            completionRate: pct(completedProjects, totalProjects),
            avgResponseTime,
            activeDiscussions: discussions.length > 0 ? activeDiscussions : '—',
            totalProjects,
            completedProjects,
            activeProjects,
            atRiskProjects,
            totalSubmissions,
            approvedSubmissions,
            pendingSubmissions,
          });
        }
      } catch {
        // leave null
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Reports &amp; Analytics</h3>
        <p className="mt-2 text-gray-600">View usage trends, project health and supervisor activity.</p>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading reports…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="card p-5">
              <h4 className="text-sm font-medium text-gray-500">Project completion rate</h4>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{data?.completionRate ?? '—'}</p>
              <p className="mt-2 text-sm text-gray-500">{data?.completedProjects ?? 0} of {data?.totalProjects ?? 0} projects completed.</p>
            </div>
            <div className="card p-5">
              <h4 className="text-sm font-medium text-gray-500">Supervisor response time</h4>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{data?.avgResponseTime ?? '—'}</p>
              <p className="mt-2 text-sm text-gray-500">Average time to review student submissions.</p>
            </div>
            <div className="card p-5">
              <h4 className="text-sm font-medium text-gray-500">Active discussions</h4>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{data?.activeDiscussions ?? '—'}</p>
              <p className="mt-2 text-sm text-gray-500">Current discussion threads across projects.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Active Projects',    value: data?.activeProjects ?? 0,    color: 'text-sky-700' },
              { label: 'At-Risk Projects',   value: data?.atRiskProjects ?? 0,    color: 'text-rose-700' },
              { label: 'Total Submissions',  value: data?.totalSubmissions ?? 0,  color: 'text-slate-700' },
              { label: 'Pending Reviews',    value: data?.pendingSubmissions ?? 0, color: 'text-amber-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <section className="card p-6">
            <h4 className="text-lg font-semibold">Submission outcomes</h4>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: 'Approved', value: data?.approvedSubmissions ?? 0, total: data?.totalSubmissions ?? 0, color: 'bg-emerald-500' },
                { label: 'Pending review', value: data?.pendingSubmissions ?? 0, total: data?.totalSubmissions ?? 0, color: 'bg-amber-400' },
              ].map(({ label, value, total, color }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-sm text-slate-600">
                    <span>{label}</span>
                    <span className="font-medium">{value} <span className="text-slate-400 font-normal">({pct(value, total)})</span></span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: total ? `${(value / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
