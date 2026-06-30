export default function StudentSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">Settings</h3>
          <p className="text-slate-600">Adjust your profile, notification preferences, and project access settings.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Notifications</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">Enabled</div>
          <p className="mt-2 text-sm text-slate-500">You will receive updates from your supervisor.</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Profile status</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">Complete</div>
          <p className="mt-2 text-sm text-slate-500">Your student profile is ready for project assignment.</p>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-lg font-semibold text-slate-900">Recommended actions</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li>Verify your student ID and project details are current.</li>
          <li>Update notification preferences for supervisor messages.</li>
          <li>Check your profile to ensure advisor access is correct.</li>
        </ul>
      </div>
    </div>
  );
}
