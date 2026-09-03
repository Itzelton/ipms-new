"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../../services/api';
import { useAuth } from '../../../components/auth/auth-context';

type Student = { id: string; email: string; preferredName?: string; firstName?: string; lastName?: string };
type Meeting = {
  id: string; title: string; scheduledAt: string; location?: string; agenda?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'; outcome?: string;
  student: Student; supervisor: any;
};

function displayName(u: Student | null) {
  if (!u) return '—';
  return u.preferredName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED:  'bg-sky-100 text-sky-700',
  COMPLETED:  'bg-emerald-100 text-emerald-700',
  CANCELLED:  'bg-slate-100 text-slate-500',
};

type ModalMode = 'create' | 'complete' | 'cancel' | null;

export default function SupervisorMeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');
  const [modal, setModal] = useState<ModalMode>(null);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Create form
  const [form, setForm] = useState({ studentId: '', title: '', scheduledAt: '', location: '', agenda: '' });
  // Outcome form
  const [outcome, setOutcome] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([apiGet('/meetings'), apiGet('/users/my-students')]);
      setMeetings(Array.isArray(m) ? m : []);
      setStudents(Array.isArray(s) ? s : []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function createMeeting() {
    if (!form.studentId || !form.title || !form.scheduledAt) return;
    setSaving(true);
    try {
      await apiPost('/meetings', {
        studentId: form.studentId,
        title: form.title,
        scheduledAt: form.scheduledAt,
        location: form.location || undefined,
        agenda: form.agenda || undefined,
      });
      setModal(null);
      setForm({ studentId: '', title: '', scheduledAt: '', location: '', agenda: '' });
      await load();
      showToast('Meeting scheduled.');
    } catch (e: any) { showToast(e?.message || 'Failed to schedule meeting.'); }
    setSaving(false);
  }

  async function completeMeeting() {
    if (!activeMeeting) return;
    setSaving(true);
    try {
      await apiPatch(`/meetings/${activeMeeting.id}`, { status: 'COMPLETED', outcome: outcome || undefined });
      setModal(null);
      setOutcome('');
      setActiveMeeting(null);
      await load();
      showToast('Meeting marked as completed.');
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
    setSaving(false);
  }

  async function cancelMeeting() {
    if (!activeMeeting) return;
    setSaving(true);
    try {
      await apiPatch(`/meetings/${activeMeeting.id}`, { status: 'CANCELLED' });
      setModal(null);
      setActiveMeeting(null);
      await load();
      showToast('Meeting cancelled.');
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
    setSaving(false);
  }

  const filtered = meetings.filter((m) => tab === 'All' || m.status === tab.toUpperCase());
  const counts = {
    scheduled: meetings.filter(m => m.status === 'SCHEDULED').length,
    completed:  meetings.filter(m => m.status === 'COMPLETED').length,
    cancelled:  meetings.filter(m => m.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">{toast}</div>
      )}

      {/* Create modal */}
      {modal === 'create' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Schedule Meeting</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-500">Student</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none">
                  <option value="">Select student…</option>
                  {students.map(s => <option key={s.id} value={s.id}>{displayName(s)} ({s.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-500">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Chapter 1 Review" className="input w-full" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-500">Date & Time</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  className="input w-full" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-500">Location (optional)</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Room 204 or Google Meet" className="input w-full" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-500">Agenda (optional)</label>
                <textarea value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
                  placeholder="Topics to discuss…" rows={3} className="input w-full resize-none" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setModal(null)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={createMeeting} disabled={saving || !form.studentId || !form.title || !form.scheduledAt}
                className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
                {saving ? 'Scheduling…' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete modal */}
      {modal === 'complete' && activeMeeting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Mark as Completed</h3>
            <p className="text-sm text-slate-500">"{activeMeeting.title}" with {displayName(activeMeeting.student)}</p>
            <div>
              <label className="block mb-1 text-xs font-semibold text-slate-500">Outcome notes (optional)</label>
              <textarea value={outcome} onChange={e => setOutcome(e.target.value)}
                placeholder="Summary of what was discussed…" rows={4} className="input w-full resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setModal(null); setActiveMeeting(null); }} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={completeMeeting} disabled={saving}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Mark completed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {modal === 'cancel' && activeMeeting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Cancel Meeting?</h3>
            <p className="text-sm text-slate-500">This will cancel "{activeMeeting.title}" and notify the student.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setModal(null); setActiveMeeting(null); }} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Back</button>
              <button onClick={cancelMeeting} disabled={saving}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                {saving ? 'Cancelling…' : 'Cancel meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="card-static p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">Meetings</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Meetings</h2>
            <p className="mt-1 text-sm text-slate-500">Schedule and manage meetings with your students.</p>
          </div>
          <button onClick={() => setModal('create')}
            className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition flex-shrink-0">
            + Schedule meeting
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Scheduled', value: counts.scheduled, color: 'text-sky-600' },
          { label: 'Completed', value: counts.completed, color: 'text-emerald-600' },
          { label: 'Cancelled', value: counts.cancelled, color: 'text-slate-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {(['All', 'Scheduled', 'Completed', 'Cancelled'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading meetings…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-500">No meetings yet.</p>
          <p className="mt-1 text-xs text-slate-400">Click "Schedule meeting" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="card p-5 flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Date */}
              <div className="flex-shrink-0 sm:w-16 text-center">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{new Date(m.scheduledAt).toLocaleDateString('en-GB', { month: 'short' })}</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none mt-0.5">{new Date(m.scheduledAt).getDate()}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{fmtTime(m.scheduledAt)}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[m.status]}`}>
                    {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Student: {displayName(m.student)}{m.location && <> &middot; {m.location}</>}
                </p>
                {m.agenda && <p className="mt-2 text-[12px] text-slate-500 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2"><span className="font-medium text-slate-600">Agenda: </span>{m.agenda}</p>}
                {m.outcome && <p className="mt-2 text-[12px] text-emerald-700 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2"><span className="font-medium">Outcome: </span>{m.outcome}</p>}
              </div>

              {/* Actions */}
              {m.status === 'SCHEDULED' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setActiveMeeting(m); setOutcome(''); setModal('complete'); }}
                    className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition">
                    Complete
                  </button>
                  <button onClick={() => { setActiveMeeting(m); setModal('cancel'); }}
                    className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
