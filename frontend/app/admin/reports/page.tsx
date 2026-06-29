export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Reports & Analytics</h3>
        <p className="mt-2 text-gray-600">View usage trends, project health and supervisor activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Project completion rate</h4>
          <p className="mt-4 text-3xl font-semibold text-slate-900">84%</p>
          <p className="mt-2 text-sm text-gray-500">Tracked across all active projects.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Supervisor response time</h4>
          <p className="mt-4 text-3xl font-semibold text-slate-900">18h</p>
          <p className="mt-2 text-sm text-gray-500">Average time to review student submissions.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500">Active discussions</h4>
          <p className="mt-4 text-3xl font-semibold text-slate-900">42</p>
          <p className="mt-2 text-sm text-gray-500">Current discussion threads across projects.</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-semibold">Report summary</h4>
        <div className="mt-4 space-y-4 text-sm text-slate-700">
          <p>Review dashboard risk factors, student engagement, and project progress in one central location.</p>
          <p>Admin reports help identify high-priority approvals and resource gaps quickly.</p>
        </div>
      </section>
    </div>
  );
}
