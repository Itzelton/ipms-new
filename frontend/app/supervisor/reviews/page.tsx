export default function SupervisorReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">Review Queue</h3>
          <p className="text-slate-600">Review recent student submissions and approve project milestones with confidence.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Pending reviews</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">8</div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Overdue reviews</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">2</div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Average turn-around</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">16h</div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-lg font-semibold text-slate-900">Review priorities</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li>Start with submissions missing supervisor feedback.</li>
          <li>Prioritize milestone approvals for projects due soon.</li>
          <li>Flag any work requiring revision before the next defense.</li>
        </ul>
      </div>
    </div>
  );
}
