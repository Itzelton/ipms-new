export default function SupervisorSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">Settings</h3>
          <p className="text-slate-600">Manage your supervisor profile, notification preferences, and availability.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Email notifications</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">Enabled</div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Review load</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">8 tasks</div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-lg font-semibold text-slate-900">Settings actions</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li>Update your availability and preferred review schedule.</li>
          <li>Set alerts for high-priority student submissions.</li>
          <li>Review your notification delivery preferences.</li>
        </ul>
      </div>
    </div>
  );
}
