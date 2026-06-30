export default function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">User Management</h3>
        <p className="mt-2 text-gray-600">Manage students, supervisors and administrators from one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm font-medium text-slate-500">Total students</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">954</div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium text-slate-500">Supervisors</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">47</div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium text-slate-500">Active admins</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">6</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-semibold">Next actions</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li>Review pending supervisor approvals.</li>
          <li>Verify student accounts with incomplete profiles.</li>
          <li>Assign additional supervisors to overloaded project groups.</li>
        </ul>
      </div>
    </div>
  );
}
