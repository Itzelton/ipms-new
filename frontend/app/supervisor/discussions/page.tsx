export default function SupervisorDiscussionsPage() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">Discussions</h3>
          <p className="text-slate-600">Track project conversations, reply to student comments, and keep teams aligned.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Open threads</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">14</div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Recently active</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">6</div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-lg font-semibold text-slate-900">Discussion guidance</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li>Respond to open questions from students within 24 hours.</li>
          <li>Close resolved threads to keep the dashboard focused.</li>
          <li>Tag project threads with milestone references for clarity.</li>
        </ul>
      </div>
    </div>
  );
}
