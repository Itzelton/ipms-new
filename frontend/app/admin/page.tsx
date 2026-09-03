"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '../../services/api';

const quickLinks = [
  { href: '/admin/students',    label: 'Students',            icon: '🎓' },
  { href: '/admin/supervisors', label: 'Supervisors',         icon: '👨‍🏫' },
  { href: '/admin/assignments', label: 'Assignments',         icon: '🔗' },
  { href: '/admin/projects',    label: 'Project oversight',   icon: '📁' },
  { href: '/admin/reports',     label: 'Reports & analytics', icon: '📊' },
  { href: '/admin/bulk-upload', label: 'Bulk upload',         icon: '📤' },
  { href: '/admin/approvals',   label: 'Approvals',           icon: '✅' },
  { href: '/admin/audit',       label: 'Audit trail',         icon: '🔍' },
];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function AdminIndex() {
  const [stats, setStats] = useState([
    { label: 'Active Users',      value: '—', detail: 'Students, supervisors, admins', gradient: 'from-sky-400 to-blue-600',      valueColor: 'text-sky-600' },
    { label: 'Projects',          value: '—', detail: 'All active capstone projects',  gradient: 'from-violet-400 to-indigo-600', valueColor: 'text-violet-600' },
    { label: 'Pending Approvals', value: '—', detail: 'Awaiting admin review',          gradient: 'from-amber-400 to-orange-500',  valueColor: 'text-amber-600' },
    { label: 'System Alerts',     value: '—', detail: 'Critical risk signals',          gradient: 'from-rose-400 to-rose-600',     valueColor: 'text-rose-600' },
  ]);
  const [activity, setActivity] = useState<any[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [usersRes, projectsRes, approvalsRes, auditRes] = await Promise.allSettled([
          apiGet('/users'),
          apiGet('/projects'),
          apiGet('/users?isActive=false'),
          apiGet('/audit?limit=5'),
        ]);

        const users      = usersRes.status      === 'fulfilled' ? (Array.isArray(usersRes.value)      ? usersRes.value      : usersRes.value?.data      ?? []) : [];
        const projects   = projectsRes.status   === 'fulfilled' ? (Array.isArray(projectsRes.value)   ? projectsRes.value   : projectsRes.value?.data   ?? []) : [];
        const inactive   = approvalsRes.status  === 'fulfilled' ? (Array.isArray(approvalsRes.value)  ? approvalsRes.value  : approvalsRes.value?.data  ?? []) : [];
        const auditRows  = auditRes.status       === 'fulfilled' ? (Array.isArray(auditRes.value)       ? auditRes.value       : auditRes.value?.data       ?? []) : [];

        const activeUsers   = users.filter((u: any) => u.isActive).length;
        const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
        const pendingCount  = inactive.length;

        // Count critical/high risk signals across all projects that have them
        const alertCount = projects.filter((p: any) =>
          p.riskSignals?.some((r: any) => r.severity === 'CRITICAL' || r.severity === 'HIGH')
        ).length;

        if (mounted) {
          setAlertCount(alertCount);
          setStats([
            { label: 'Active Users',      value: fmt(activeUsers),    detail: 'Students, supervisors, admins', gradient: 'from-sky-400 to-blue-600',      valueColor: 'text-sky-600' },
            { label: 'Projects',          value: fmt(activeProjects), detail: 'Active capstone projects',      gradient: 'from-violet-400 to-indigo-600', valueColor: 'text-violet-600' },
            { label: 'Pending Approvals', value: fmt(pendingCount),   detail: 'Awaiting admin review',          gradient: 'from-amber-400 to-orange-500',  valueColor: 'text-amber-600' },
            { label: 'System Alerts',     value: fmt(alertCount),     detail: 'Critical risk signals',          gradient: 'from-rose-400 to-rose-600',     valueColor: 'text-rose-600' },
          ]);

          setActivity(
            auditRows.slice(0, 5).map((a: any) => ({
              title: `${a.action} — ${a.entity}`,
              body: a.actor
                ? `by ${a.actor.preferredName || [a.actor.firstName, a.actor.lastName].filter(Boolean).join(' ') || a.actor.email}`
                : 'System action',
              ts: a.createdAt,
            }))
          );
        }
      } catch {
        // leave placeholder state
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
            <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-500">
              Admin workspace
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">Control center for users, projects and system insights.</p>
          </div>
          {!loading && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${alertCount === 0 ? 'bg-emerald-400' : alertCount < 3 ? 'bg-amber-400' : 'bg-rose-400'}`} />
              System health: {alertCount === 0 ? 'Good' : alertCount < 3 ? 'Caution' : 'At Risk'}
            </div>
          )}
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{stat.label}</p>
                <p className={`mt-2 text-3xl font-bold tabular-nums tracking-tight ${stat.valueColor} ${loading ? 'opacity-40' : ''}`}>
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[12px] text-slate-400">{stat.detail}</p>
              </div>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Quick actions */}
        <section className="card p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Quick Actions</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[13px] font-medium text-slate-700 no-underline transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <span className="text-base leading-none">{link.icon}</span>
                {link.label}
                <svg className="ml-auto h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="card p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Recent Activity</p>
          {loading ? (
            <p className="text-[13px] text-slate-400">Loading…</p>
          ) : activity.length === 0 ? (
            <p className="text-[13px] text-slate-400">No recent activity.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {activity.map((item, i) => (
                <li key={i} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                      <p className="mt-0.5 text-[12px] text-slate-500">{item.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/audit" className="mt-4 inline-block text-[12px] font-medium text-sky-600 hover:text-sky-700 no-underline">
            View full audit trail →
          </Link>
        </section>
      </div>
    </div>
  );
}
