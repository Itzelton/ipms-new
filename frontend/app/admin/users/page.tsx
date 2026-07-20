"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPatch } from '../../../services/api';

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  roles: string[];
  studentProfile?: { advisorId?: string | null } | null;
};

function displayName(u: User) {
  return u.preferredName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

export default function AdminUsersPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'students' | 'supervisors'>('students');
  const [assigning, setAssigning] = useState<string | null>(null); // studentId being assigned
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, sv] = await Promise.all([
        apiGet('/users/students'),
        apiGet('/users/supervisors'),
      ]);
      setStudents(Array.isArray(s) ? s : []);
      setSupervisors(Array.isArray(sv) ? sv : []);
    } catch {
      // leave empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openAssign(studentId: string, currentAdvisorId?: string | null) {
    setAssigning(studentId);
    setSelectedSupervisor(currentAdvisorId ?? '');
  }

  async function saveAssignment() {
    if (!assigning) return;
    setSaving(true);
    try {
      await apiPatch(`/users/${assigning}/assign-supervisor`, {
        supervisorId: selectedSupervisor || null,
      });
      await load();
      showToast('Supervisor assigned successfully.');
      setAssigning(null);
    } catch (e: any) {
      showToast(e?.message || 'Failed to assign supervisor.');
    } finally {
      setSaving(false);
    }
  }

  const supervisorMap = Object.fromEntries(supervisors.map((s) => [s.id, s]));

  const unassigned = students.filter((s) => !s.studentProfile?.advisorId);
  const assigned = students.filter((s) => s.studentProfile?.advisorId);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Modal */}
      {assigning && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Assign Supervisor</h3>
            <p className="text-sm text-slate-500">
              Select a supervisor for{' '}
              <strong>{displayName(students.find((s) => s.id === assigning)!)}</strong>.
            </p>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none"
            >
              <option value="">— Unassigned —</option>
              {supervisors.map((sv) => (
                <option key={sv.id} value={sv.id}>
                  {displayName(sv)} ({sv.email})
                </option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAssigning(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={saveAssignment}
                disabled={saving}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="card-static p-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h2>
        <p className="mt-1 text-sm text-slate-500">
          Assign supervisors to students. Every student should have a supervisor before they begin work.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total students', value: students.length },
          { label: 'Unassigned', value: unassigned.length, highlight: unassigned.length > 0 },
          { label: 'Assigned', value: assigned.length },
          { label: 'Supervisors', value: supervisors.length },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
        {(['students', 'supervisors'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-400">Loading users…</div>
      ) : tab === 'students' ? (
        <div className="space-y-4">
          {unassigned.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <h3 className="text-sm font-semibold text-slate-700">
                  Unassigned students ({unassigned.length})
                </h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {unassigned.map((student) => (
                  <li key={student.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{displayName(student)}</p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>
                    <button
                      onClick={() => openAssign(student.id, null)}
                      className="rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                    >
                      Assign supervisor
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-700">
                Assigned students ({assigned.length})
              </h3>
            </div>
            {assigned.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">No students assigned yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {assigned.map((student) => {
                  const sv = supervisorMap[student.studentProfile?.advisorId ?? ''];
                  return (
                    <li key={student.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{displayName(student)}</p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-600">
                            {sv ? displayName(sv) : 'Unknown supervisor'}
                          </p>
                          <p className="text-[11px] text-slate-400">{sv?.email}</p>
                        </div>
                        <button
                          onClick={() => openAssign(student.id, student.studentProfile?.advisorId)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition"
                        >
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
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-700">All supervisors ({supervisors.length})</h3>
          </div>
          {supervisors.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-400">No supervisors found.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {supervisors.map((sv) => {
                const myStudents = assigned.filter(
                  (s) => s.studentProfile?.advisorId === sv.id,
                );
                return (
                  <li key={sv.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{displayName(sv)}</p>
                      <p className="text-xs text-slate-400">{sv.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {myStudents.length} student{myStudents.length !== 1 ? 's' : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
