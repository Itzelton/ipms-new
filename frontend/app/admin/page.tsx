import Link from 'next/link';

const stats = [
  { label: 'Active Users',       value: '1,284', detail: 'Students, supervisors, admins', gradient: 'from-sky-400 to-blue-600',     valueColor: 'text-sky-600' },
  { label: 'Projects',           value: '128',   detail: 'All active capstone projects',   gradient: 'from-violet-400 to-indigo-600', valueColor: 'text-violet-600' },
  { label: 'Pending Approvals',  value: '12',    detail: 'Awaiting admin review',           gradient: 'from-amber-400 to-orange-500',  valueColor: 'text-amber-600' },
  { label: 'System Alerts',      value: '3',     detail: 'Security or workflow flags',      gradient: 'from-rose-400 to-rose-600',     valueColor: 'text-rose-600' },
];

const quickLinks = [
  { href: '/admin/users',    label: 'User management',    icon: '👥' },
  { href: '/admin/projects', label: 'Project oversight',  icon: '📁' },
  { href: '/admin/reports',  label: 'Reports & analytics',icon: '📊' },
  { href: '/admin/settings', label: 'Platform settings',  icon: '⚙️' },
];

const recentActivity = [
  { title: 'Approval workflow updated', body: 'New user onboarding now requires supervisor consent.' },
  { title: 'System audit scheduled',    body: 'Quarterly audit starts in 5 days.' },
  { title: 'Report generated',          body: 'Faculty performance metrics are ready for review.' },
];

export default function AdminIndex() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="card-static p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
              Admin workspace
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">Control center for users, projects and system insights.</p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium text-slate-700"
            style={{ background: 'rgba(248,250,252,0.80)', border: '1px solid rgba(226,232,240,0.80)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            System health: Good
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{stat.label}</p>
                <p className={`mt-2 text-3xl font-bold tabular-nums tracking-tight ${stat.valueColor}`}>{stat.value}</p>
                <p className="mt-1.5 text-[12px] text-slate-400">{stat.detail}</p>
              </div>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} opacity-15`} />
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
                className="group flex items-center gap-3 rounded-xl px-4 py-3.5 text-[13px] font-medium text-slate-700 no-underline transition-all hover:text-slate-900"
                style={{
                  background: 'rgba(248,250,252,0.70)',
                  border: '1px solid rgba(226,232,240,0.60)',
                }}
              >
                <span className="text-base leading-none">{link.icon}</span>
                {link.label}
                <svg className="ml-auto h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="card p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Recent Activity</p>
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((item) => (
              <li key={item.title} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                  <div>
                    <p className="text-[13px] font-medium text-slate-800">{item.title}</p>
                    <p className="mt-0.5 text-[12px] text-slate-500">{item.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
