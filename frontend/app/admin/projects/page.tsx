export default function AdminProjectsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">Project Management</h3>
        <p className="mt-2 text-gray-600">Overview active capstone projects, review progress and spot stalled work.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm font-medium text-slate-500">Total projects</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">128</div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium text-slate-500">At risk</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">17</div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium text-slate-500">Recently completed</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">24</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-semibold">Project inspections</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li>Identify stalled projects and escalate to supervisors.</li>
          <li>Cross-check project ownership and reporting cadence.</li>
          <li>Review flagged milestone delays with stakeholders.</li>
        </ul>
      </div>
    </div>
  );
}
