"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPatch } from '../../../services/api';

type Student = { id: string; email: string; firstName?: string; lastName?: string; preferredName?: string; studentProfile?: { advisorId?: string | null } | null };
type Supervisor = { id: string; email: string; firstName?: string; lastName?: string; preferredName?: string };

function displayName(u: { email: string; firstName?: string; lastName?: string; preferredName?: string } | null) {
  if (!u) return '—';
  return u.preferredName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

export default function AdminAssignmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedSv, setSelectedSv] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, sv] = await Promise.all([apiGet('/users/students'), apiGet('/users/supervisors')]);
      setStudents(Array.isArray(s) ? s : []);
      setSupervisors(Array.isArray(sv) ? sv : []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function openAssign(studentId: string, currentAdvisorId?: string | null) {
    setAssigning(studentId);
    setSelectedSv(currentAdvisorId ?? '');
  }

  async function saveAssignment() {
    if (!assigning) return;
    setSaving(true);
    try {
      await apiPatch(`/users/${assigning}/assign-supervisor`, { supervisorId: selectedSv || null });
      await load();
      showToast('Assignment saved.');
      setAssigning(null);
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
    setSaving(false);
  }

  const svMap = Object.fromEntries(supervisors.map(sv => [sv.id, sv]));
  const unassigned = students.filter(s => !s.studentProfile?.advisorId);
  const assigned = students.filter(s => s.studentProfile?.advisorId);

  const filteredUnassigned = unassigned.filter(s => displayName(s).toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
  const filteredAssigned = assigned.filter(s => displayName(s).toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">{toast}</div>}

      {assigning && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Assign Supervisor</h3>
            <p className="text-sm text-slate-500">Student: <strong>{displayName(students.find(s => s.id === assigning)!)}</strong></p>
            <select value={selectedSv} onChange={e => setSelectedSv(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none">
              <option value="">— Unassigned —</option>
              {supervisors.map(sv => <option key={sv.id} value={sv.id}>{displayName(sv)} ({sv.email})</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAssigning(null)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={saveAssignment} disabled={saving}
                className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="card-static p-6">
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">Admin</span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Assignments</h2>
        <p className="mt-1 text-sm text-slate-500">Assign supervisors to students.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total students', value: students.length, color: 'text-slate-900' },
          { label: 'Unassigned', value: unassigned.length, color: unassigned.length > 0 ? 'text-amber-600' : 'text-slate-900' },
          { label: 'Assigned', value: assigned.length, color: 'text-emerald-600' },
          { label: 'Supervisors', value: supervisors.length, color: 'text-slate-900' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card px-5 py-3 flex items-center gap-3">
        <svg className="h-4 w-4 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none flex-1" />
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading…</div>
      ) : (
        <div className="space-y-4">
          {/* Unassigned */}
          {filteredUnassigned.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <h3 className="text-sm font-semibold text-slate-700">Unassigned ({filteredUnassigned.length})</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {filteredUnassigned.map(s => (
                  <li key={s.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{displayName(s)}</p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </div>
                    <button onClick={() => openAssign(s.id, null)} className="rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition">
                      Assign supervisor
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assigned */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-700">Assigned ({filteredAssigned.length})</h3>
            </div>
            {filteredAssigned.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">No assigned students yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredAssigned.map(s => {
                  const sv = svMap[s.studentProfile?.advisorId ?? ''];
                  return (
                    <li key={s.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{displayName(s)}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold text-slate-600">{sv ? displayName(sv) : 'Unknown'}</p>
                          <p className="text-[11px] text-slate-400">{sv?.email}</p>
                        </div>
                        <button onClick={() => openAssign(s.id, s.studentProfile?.advisorId)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-300 transition">
                          Change
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
