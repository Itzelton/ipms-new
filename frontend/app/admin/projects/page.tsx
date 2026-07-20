"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../../services/api';

type Person = { id: string; email: string; firstName?: string; lastName?: string };

type Project = {
  id: string;
  title: string;
  description?: string;
  status: string;
  type: string;
  student?: Person | null;
  supervisor?: Person | null;
  createdAt: string;
};

type Supervisor = Person & { preferredName?: string };

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Active',     cls: 'badge-green'  },
  PROPOSED:  { label: 'Proposed',   cls: 'badge-blue'   },
  ON_HOLD:   { label: 'On Hold',    cls: 'badge-yellow' },
  COMPLETED: { label: 'Completed',  cls: 'badge-gray'   },
  CANCELLED: { label: 'Cancelled',  cls: 'badge-red'    },
};

const TYPE_LABELS: Record<string, string> = {
  RESEARCH:   'Research',
  CAPSTONE:   'Capstone',
  THESIS:     'Thesis',
  INTERNSHIP: 'Internship',
  OTHER:      'Other',
};

function displayName(u?: Person | null): string {
  if (!u) return '—';
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

function initials(u?: Person | null): string {
  const name = displayName(u);
  if (name === '—') return '?';
  const parts = name.split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// ── Assign Supervisor Modal ──────────────────────────────────────────────────

function AssignSupervisorModal({
  project,
  onClose,
  onAssigned,
}: {
  project: Project;
  onClose: () => void;
  onAssigned: (projectId: string, supervisor: Supervisor) => void;
}) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Supervisor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/users?role=SUPERVISOR&limit=200')
      .then((data) => setSupervisors(Array.isArray(data) ? data : []))
      .catch(() => setSupervisors([]))
      .finally(() => setLoadingSupervisors(false));
  }, []);

  const filtered = supervisors.filter((s) => {
    const q = search.toLowerCase();
    return displayName(s).toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  async function handleAssign() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await apiPatch(`/projects/${project.id}/assign-supervisor`, { supervisorId: selected.id });
      onAssigned(project.id, selected);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to assign supervisor');
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-md overflow-hidden p-0">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">Assign Supervisor</h3>
              <p className="mt-0.5 text-sm text-slate-500 truncate">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {project.supervisor && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-700 border border-sky-100">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Currently assigned to <span className="font-medium">{displayName(project.supervisor)}</span>
            </div>
          )}

          <div className="mt-3 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              autoFocus
              className="input pl-9"
              placeholder="Search supervisors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Supervisor list */}
        <div className="overflow-y-auto max-h-64 px-2 py-2">
          {loadingSupervisors ? (
            <div className="space-y-1 px-2 py-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
                    <div className="h-3 w-48 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-slate-400">
              {search ? 'No supervisors match your search.' : 'No supervisors found.'}
            </div>
          ) : (
            filtered.map((s) => {
              const isSelected = selected?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(isSelected ? null : s)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-sky-50 ring-1 ring-inset ring-sky-300'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-sky-500 text-white'
                        : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'
                    }`}
                  >
                    {initials(s)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800 truncate">{displayName(s)}</div>
                    <div className="text-xs text-slate-500 truncate">{s.email}</div>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-sky-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          {error && (
            <p className="mb-3 text-xs text-rose-600 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selected || saving}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={!selected || saving ? { transform: 'none', boxShadow: 'none' } : {}}
            >
              {saving ? 'Assigning…' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalProject, setModalProject] = useState<Project | null>(null);

  useEffect(() => {
    apiGet('/projects?limit=200')
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAssigned = useCallback((projectId: string, supervisor: Supervisor) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, supervisor: { id: supervisor.id, email: supervisor.email, firstName: supervisor.firstName, lastName: supervisor.lastName } }
          : p
      )
    );
  }, []);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.title.toLowerCase().includes(q) ||
      displayName(p.student).toLowerCase().includes(q) ||
      displayName(p.supervisor).toLowerCase().includes(q);
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const total      = projects.length;
  const active     = projects.filter((p) => p.status === 'ACTIVE').length;
  const proposed   = projects.filter((p) => p.status === 'PROPOSED').length;
  const unassigned = projects.filter((p) => !p.supervisor).length;

  return (
    <>
      {modalProject && (
        <AssignSupervisorModal
          project={modalProject}
          onClose={() => setModalProject(null)}
          onAssigned={handleAssigned}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Project Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Oversee all capstone projects, monitor progress and assign supervisors.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Projects', value: loading ? null : total },
            { label: 'Active',         value: loading ? null : active },
            { label: 'Proposed',       value: loading ? null : proposed },
            { label: 'Unassigned',     value: loading ? null : unassigned, warn: !loading && unassigned > 0 },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <div className="text-sm font-medium text-slate-500">{s.label}</div>
              {s.value === null ? (
                <div className="mt-2 h-8 w-12 rounded-lg bg-slate-100 animate-pulse" />
              ) : (
                <div className={`mt-2 text-3xl font-semibold ${s.warn ? 'text-rose-500' : 'text-slate-900'}`}>
                  {s.value}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              className="input pl-9"
              placeholder="Search by project title, student or supervisor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input sm:w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Project
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Student
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Supervisor
                  </th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded-lg bg-slate-100 animate-pulse" style={{ width: j === 5 ? '4rem' : '70%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-slate-400 text-sm">
                      {search || statusFilter ? 'No projects match your search.' : 'No projects yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const sc = STATUS_CONFIG[p.status] ?? { label: p.status, cls: 'badge-gray' };
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-medium text-slate-800 truncate">{p.title}</div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {TYPE_LABELS[p.type] ?? p.type}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-slate-700">{displayName(p.student)}</div>
                          {p.student?.email && (
                            <div className="text-xs text-slate-400">{p.student.email}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`badge ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {p.supervisor ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                                {initials(p.supervisor)}
                              </div>
                              <div>
                                <div className="text-slate-700 font-medium text-sm">{displayName(p.supervisor)}</div>
                                <div className="text-xs text-slate-400">{p.supervisor.email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-red">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setModalProject(p)}
                            className="btn-secondary text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {p.supervisor ? 'Reassign' : 'Assign'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
              Showing {filtered.length} of {total} project{total !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
