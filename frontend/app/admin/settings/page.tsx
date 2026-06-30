export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Settings</h3>
        <p className="mt-2 text-gray-600">Configure platform policies, notification rules, and security settings.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Platform status</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">Healthy</div>
          <p className="mt-2 text-sm text-gray-500">All systems normal.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Notifications</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">Enabled</div>
          <p className="mt-2 text-sm text-gray-500">Email and dashboard alerts are active.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-semibold">Admin actions</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li>Update site-wide access roles and permissions.</li>
          <li>Review authentication policy and password requirements.</li>
          <li>Manage integrations with external services.</li>
        </ul>
      </div>
    </div>
  );
}
