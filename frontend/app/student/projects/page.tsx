"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, apiUpload } from '../../../services/api';
import FilterBar from '../../../components/ui/FilterBar';

type Supervisor = { id: string; email: string; firstName?: string; lastName?: string; preferredName?: string };
type Me = { studentProfile?: { advisorId?: string | null } };
type Project = {
  id: string; title: string; description?: string; status: string;
  type: string; supervisorId?: string;
  supervisor?: { id: string; firstName?: string; lastName?: string; email: string };
  proposalDocUrl?: string;
  createdAt: string;
  progress?: number;
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PROPOSED:  { label: 'Pending review', color: 'bg-amber-100 text-amber-700' },
  ACTIVE:    { label: 'Active',         color: 'bg-emerald-100 text-emerald-700' },
  ON_HOLD:   { label: 'On hold',        color: 'bg-slate-100 text-slate-600' },
  COMPLETED: { label: 'Completed',      color: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Rejected',       color: 'bg-rose-100 text-rose-700' },
};

const PROJECT_TYPES = ['CAPSTONE', 'RESEARCH', 'THESIS', 'INTERNSHIP', 'OTHER'];

const STATUS_OPTIONS = [
  { value: 'PROPOSED',  label: 'Pending' },
  { value: 'ACTIVE',    label: 'Active' },
  { value: 'ON_HOLD',   label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Rejected' },
];

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest first' },
  { value: 'created_asc',  label: 'Oldest first' },
  { value: 'title_asc',    label: 'Title A–Z' },
  { value: 'title_desc',   label: 'Title Z–A' },
];

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignedSupervisor, setAssignedSupervisor] = useState<Supervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('created_desc');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('CAPSTONE');
  const [supervisorId, setSupervisorId] = useState('');
  const [proposalFile, setProposalFile] = useState<File | null>(null);

  async function load() {
    try {
      const [p, meRes] = await Promise.allSettled([
        apiGet('/projects'),
        apiGet('/auth/me'),
      ]);
      if (p.status === 'fulfilled' && Array.isArray(p.value)) setProjects(p.value);
      if (meRes.status === 'fulfilled') {
        const advisorId = (meRes.value as Me)?.studentProfile?.advisorId;
        if (advisorId) {
          setSupervisorId(advisorId);
          try {
            const sv = await apiGet(`/users/${advisorId}`);
            setAssignedSupervisor(sv);
          } catch { /* ignore */ }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    list.sort((a, b) => {
      if (sort === 'title_asc')    return (a.title ?? '').localeCompare(b.title ?? '');
      if (sort === 'title_desc')   return (b.title ?? '').localeCompare(a.title ?? '');
      if (sort === 'created_asc')  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [projects, search, statusFilter, sort]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!supervisorId || !assignedSupervisor) { setError('No supervisor assigned. Please contact an admin.'); return; }
    setError(null);
    setSubmitting(true);
    try {
      let proposalDocUrl: string | undefined;
      if (proposalFile) {
        const fd = new FormData();
        fd.append('file', proposalFile);
        const res = await apiUpload('/storage/upload?folder=proposals', fd);
        proposalDocUrl = res?.url ?? undefined;
      }
      await apiPost('/projects', {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        supervisorId,
        status: 'PROPOSED',
        ...(proposalDocUrl && { proposalDocUrl }),
      });
      setTitle(''); setDescription(''); setType('CAPSTONE'); setProposalFile(null);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  }

  function supervisorName(s: Supervisor) {
    return s.preferredName || [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email;
  }

  const hasActive = projects.some((p) => p.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-static p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">My Projects</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Projects &amp; Proposals</h2>
            <p className="mt-1 text-sm text-slate-500">Submit a proposal to a supervisor, then track its status here.</p>
          </div>
          {!hasActive && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
            >
              {showForm ? 'Cancel' : '+ New Proposal'}
            </button>
          )}
        </div>
      </div>

      {/* Proposal form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Submit a Proposal</h3>
          {error && <div className="mb-4 rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title <span className="text-rose-500">*</span></label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI-powered attendance system"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100">
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor <span className="text-rose-500">*</span></label>
                {assignedSupervisor ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-xs font-bold text-white">
                      {supervisorName(assignedSupervisor).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{supervisorName(assignedSupervisor)}</p>
                      <p className="text-[11px] text-slate-400">{assignedSupervisor.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
                    No supervisor assigned yet. Contact an admin to get assigned.
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief overview of your project idea..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proposal Document
                  <span className="ml-1.5 text-[11px] font-normal text-slate-400">(optional — PDF, DOCX, etc.)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm transition hover:border-sky-400 hover:bg-sky-50">
                  <svg className="h-5 w-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                  <span className="text-slate-500">
                    {proposalFile ? (
                      <span className="font-medium text-sky-700">{proposalFile.name}</span>
                    ) : (
                      'Click to attach a document'
                    )}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.odt"
                    className="sr-only"
                    onChange={(e) => setProposalFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {proposalFile && (
                  <button
                    type="button"
                    onClick={() => setProposalFile(null)}
                    className="mt-1 text-[11px] text-rose-500 hover:text-rose-700"
                  >
                    Remove file
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={submitting || !assignedSupervisor} className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition">
                {submitting ? 'Submitting…' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter bar — only show when there are projects */}
      {!loading && projects.length > 0 && (
        <FilterBar
          search={search}
          onSearch={setSearch}
          statusOptions={STATUS_OPTIONS}
          activeStatus={statusFilter}
          onStatus={setStatusFilter}
          sortOptions={SORT_OPTIONS}
          activeSort={sort}
          onSort={setSort}
          resultCount={filteredProjects.length}
          totalCount={projects.length}
        />
      )}

      {/* Project list */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
            <svg className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">No proposals yet</p>
          <p className="mt-1 text-xs text-slate-400">Submit your first proposal to get started.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition">
            + New Proposal
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm font-medium text-slate-700">No projects match your filters.</p>
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); }}
            className="mt-3 text-xs text-sky-600 hover:text-sky-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((p) => {
            const st = STATUS_LABEL[p.status] ?? { label: p.status, color: 'bg-slate-100 text-slate-600' };
            const supName = p.supervisor
              ? [p.supervisor.firstName, p.supervisor.lastName].filter(Boolean).join(' ') || p.supervisor.email
              : '—';
            return (
              <div key={p.id} className="card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">{p.title}</h4>
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.color}`}>{st.label}</span>
                </div>
                {p.description && <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>}
                {typeof p.progress === 'number' && p.status === 'ACTIVE' && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-semibold tabular-nums text-slate-600">{p.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span><span className="font-medium text-slate-600">Type:</span> {p.type.charAt(0) + p.type.slice(1).toLowerCase()}</span>
                  <span><span className="font-medium text-slate-600">Supervisor:</span> {supName}</span>
                </div>
                {p.proposalDocUrl && (
                  <a
                    href={p.proposalDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200 transition no-underline"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32" />
                    </svg>
                    View proposal document
                  </a>
                )}
                {p.status === 'PROPOSED' && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                    Awaiting supervisor review. You'll get notified when they respond.
                  </p>
                )}
                {p.status === 'CANCELLED' && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                    This proposal was not accepted. You may submit a new one.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
