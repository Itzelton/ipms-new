export default function StudentDiscussionsPage() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">Discussions</h3>
          <p className="text-slate-600">Join conversation threads with your supervisor, ask questions, and receive clear project feedback.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Active threads</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">11</div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Unread messages</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">3</div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-lg font-semibold text-slate-900">Discussion priorities</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li>Answer open questions from your supervisor promptly.</li>
          <li>Keep threads organized by topic and milestone.</li>
          <li>Use discussion notes to capture decisions and next steps.</li>
        </ul>
      </div>
    </div>
  );
}
