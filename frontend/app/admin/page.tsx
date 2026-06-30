import Link from 'next/link';

const stats = [
  { label: 'Active users', value: '1,284', detail: 'Students, supervisors, admins' },
  { label: 'Projects under management', value: '128', detail: 'All active capstone projects' },
  { label: 'Pending approvals', value: '12', detail: 'Awaiting admin review' },
  { label: 'System alerts', value: '3', detail: 'Security or workflow risk flags' },
];

const quickLinks = [
  { href: '/admin/users', label: 'User management' },
  { href: '/admin/projects', label: 'Project oversight' },
  { href: '/admin/reports', label: 'Reports & analytics' },
  { href: '/admin/settings', label: 'Platform settings' },
];

export default function AdminIndex() {
  return (
    <div className="space-y-6">
      <header className="space-y-3 rounded-[28px] bg-white/90 p-6 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h2>
            <p className="mt-2 text-slate-600">A friendly control center for users, projects, and system insights.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            <span>System health</span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">Good</span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="text-sm font-medium text-slate-500">{stat.label}</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</div>
            <div className="mt-2 text-sm text-slate-500">{stat.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Quick actions</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
          <ul className="mt-4 space-y-4 text-sm text-slate-700">
            <li className="rounded-3xl bg-slate-50 p-4">
              <div className="font-medium text-slate-900">Approval workflow updated</div>
              <div className="mt-1 text-slate-500">New user onboarding now requires supervisor consent.</div>
            </li>
            <li className="rounded-3xl bg-slate-50 p-4">
              <div className="font-medium text-slate-900">System audit scheduled</div>
              <div className="mt-1 text-slate-500">Quarterly audit starts in 5 days.</div>
            </li>
            <li className="rounded-3xl bg-slate-50 p-4">
              <div className="font-medium text-slate-900">Report generated</div>
              <div className="mt-1 text-slate-500">Faculty performance metrics are ready for review.</div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
