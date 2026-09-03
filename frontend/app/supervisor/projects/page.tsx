"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getProjectsForUser } from '../../../services/project';
import { apiGet } from '../../../services/api';
import ProjectList from '../../../components/project/ProjectList';
import FilterBar from '../../../components/ui/FilterBar';
import { SkeletonProjectGrid } from '../../../components/ui/Skeleton';

const STATUS_OPTIONS = [
  { value: 'ACTIVE',    label: 'Active' },
  { value: 'AT_RISK',   label: 'At Risk' },
  { value: 'PROPOSED',  label: 'Proposed' },
  { value: 'ON_HOLD',   label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'title_asc',     label: 'Title A–Z' },
  { value: 'title_desc',    label: 'Title Z–A' },
  { value: 'progress_desc', label: 'Progress (high)' },
  { value: 'progress_asc',  label: 'Progress (low)' },
  { value: 'due_asc',       label: 'Due date (soonest)' },
];

function fmtDate(iso: string) {
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso)); }
  catch { return '—'; }
}

export default function SupervisorProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [pendingSubs, setPendingSubs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('title_asc');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getProjectsForUser('SUPERVISOR'),
      apiGet('/submissions/for-supervisor?limit=100'),
    ]).then(([p, subs]) => {
      if (!mounted) return;
      setProjects(Array.isArray(p) ? p : []);
      const all: any[] = Array.isArray(subs) ? subs : subs?.data ?? [];
      setPendingSubs(all.filter((s: any) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW'));
    }).catch(() => { if (mounted) setProjects([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (typeof p.student === 'string' ? p.student : [p.student?.firstName, p.student?.lastName].filter(Boolean).join(' '))
          .toLowerCase().includes(q)
      );
    }
    if (status) list = list.filter((p) => p.status === status);
    list.sort((a, b) => {
      if (sort === 'title_asc')     return (a.title ?? '').localeCompare(b.title ?? '');
      if (sort === 'title_desc')    return (b.title ?? '').localeCompare(a.title ?? '');
      if (sort === 'progress_desc') return (b.progress ?? 0) - (a.progress ?? 0);
      if (sort === 'progress_asc')  return (a.progress ?? 0) - (b.progress ?? 0);
      if (sort === 'due_asc') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      }
      return 0;
    });
    return list;
  }, [projects, search, status, sort]);

  return (
    <div className="space-y-6">
      <div className="card-static p-6">
        <div className="flex flex-col gap-1">
          <span className="inline-flex w-fit items-center rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">Supervisor workspace</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Projects</h2>
          <p className="text-sm text-slate-500">Monitor all projects assigned to you.</p>
        </div>
      </div>

      {/* Pending reviews banner */}
      {!loading && pendingSubs.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{pendingSubs.length}</span>
              <p className="text-sm font-semibold text-slate-800">Submissions awaiting review</p>
            </div>
            <Link href="/supervisor/reviews" className="text-[11px] font-medium text-sky-600 hover:text-sky-700 no-underline">
              View all reviews →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingSubs.slice(0, 5).map((s: any) => {
              const studentName = [s.author?.firstName, s.author?.lastName].filter(Boolean).join(' ') || s.author?.email || 'Student';
              const title = s.metadata?.title || s.content?.slice(0, 50) || 'Submission';
              const age = Math.floor((Date.now() - new Date(s.createdAt).getTime()) / 3_600_000);
              const overdue = age > 168;
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-slate-800 truncate">{studentName}</span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] text-slate-500 truncate">{s.project?.title ?? '—'}</span>
                      {overdue && <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">OVERDUE</span>}
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">{title} · {fmtDate(s.createdAt)}</p>
                  </div>
                  <Link
                    href={`/supervisor/reviews?submissionId=${s.id}`}
                    className="flex-shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-violet-700 transition no-underline"
                  >
                    Review
                  </Link>
                </div>
              );
            })}
          </div>
          {pendingSubs.length > 5 && (
            <Link href="/supervisor/reviews" className="mt-3 block text-center text-[11px] font-medium text-sky-600 hover:text-sky-700 no-underline">
              + {pendingSubs.length - 5} more pending
            </Link>
          )}
        </div>
      )}

      <FilterBar
        search={search}
        onSearch={setSearch}
        statusOptions={STATUS_OPTIONS}
        activeStatus={status}
        onStatus={setStatus}
        sortOptions={SORT_OPTIONS}
        activeSort={sort}
        onSort={setSort}
        resultCount={filtered.length}
        totalCount={projects.length}
      />

      {loading ? (
        <SkeletonProjectGrid />
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">
            {projects.length === 0 ? 'No projects assigned yet' : 'No projects match your filters'}
          </p>
          {(search || status) && (
            <button
              onClick={() => { setSearch(''); setStatus(''); }}
              className="mt-3 text-xs text-sky-600 hover:text-sky-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ProjectList projects={filtered} role="SUPERVISOR" />
      )}
    </div>
  );
}
