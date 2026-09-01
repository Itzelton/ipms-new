"use client";
import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/api';

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];

const statusStyle: Record<string, { badge: string; dot: string }> = {
  COMPLETED:   { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  IN_PROGRESS: { badge: 'bg-sky-100 text-sky-700',         dot: 'bg-sky-400' },
  PENDING:     { badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400' },
  OVERDUE:     { badge: 'bg-rose-100 text-rose-700',       dot: 'bg-rose-400' },
};

function fmtDate(d: string) {
  if (!d) return '—';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
}

export default function SupervisorMilestonesPanel({ projectId, milestones: initial }: { projectId: string; milestones?: any[] }) {
  const [milestones, setMilestones] = useState<any[]>(initial ?? []);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    apiGet(`/milestones?projectId=${projectId}&limit=100`)
      .then((data) => { if (Array.isArray(data)) setMilestones(data); })
      .catch(() => {});
  }, [projectId]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) { setError('Title and due date are required.'); return; }
    setSaving(true); setError('');
    try {
      const m = await apiPost('/milestones', { title: title.trim(), description: description.trim() || undefined, projectId, dueDate });
      setMilestones((prev) => [...prev, m]);
      setTitle(''); setDescription(''); setDueDate('');
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to create milestone.');
    } finally { setSaving(false); }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const updated = await apiPatch(`/milestones/${id}`, { status });
      setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, ...updated } : m));
    } catch { /* ignore */ }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this milestone?')) return;
    try {
      await apiDelete(`/milestones/${id}`);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch { /* ignore */ }
  }

  const done = milestones.filter((m) => m.status === 'COMPLETED').length;

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Milestones</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{done}/{milestones.length} complete</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(''); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700 transition"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {showForm ? 'Cancel' : 'Add Milestone'}
        </button>
      </div>

      {milestones.length > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
            style={{ width: `${(done / milestones.length) * 100}%` }}
          />
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          {error && <p className="text-[12px] text-rose-600">{error}</p>}
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">Title <span className="text-rose-500">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Literature Review"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional notes for the student..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">Due Date <span className="text-rose-500">*</span></label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-sky-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition">
              {saving ? 'Saving…' : 'Create Milestone'}
            </button>
          </div>
        </form>
      )}

      {milestones.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-400">No milestones yet. Add the first one above.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {milestones.map((m) => {
            const s = statusStyle[m.status] ?? statusStyle.PENDING;
            return (
              <li key={m.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-slate-800">{m.title}</p>
                  {m.description && <p className="text-[11px] text-slate-400 truncate">{m.description}</p>}
                  <p className="text-[11px] text-slate-400">Due {fmtDate(m.dueDate)}</p>
                </div>
                <select
                  value={m.status ?? 'PENDING'}
                  onChange={(e) => handleStatusChange(m.id, e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(m.id)}
                  title="Delete milestone"
                  className="flex-shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
