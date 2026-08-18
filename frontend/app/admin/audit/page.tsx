"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { apiGet } from '../../../services/api';

type AuditLog = { id: string; action: string; entity: string; entityId?: string; data?: any; createdAt: string; actor?: { id: string; email: string; firstName?: string; lastName?: string; preferredName?: string } };

function displayName(u: AuditLog['actor']) {
  if (!u) return 'System';
  return u.preferredName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

function fmtDt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function actionColor(action: string) {
  if (action.startsWith('create')) return 'bg-emerald-50 text-emerald-700';
  if (action.startsWith('delete')) return 'bg-rose-50 text-rose-700';
  if (action.startsWith('update') || action.startsWith('assign')) return 'bg-sky-50 text-sky-700';
  return 'bg-slate-100 text-slate-600';
}

const ACTION_LABELS: Record<string, string> = {
  create_meeting: 'Scheduled meeting',
  update_meeting: 'Updated meeting',
  delete_meeting: 'Deleted meeting',
  create_milestone: 'Created milestone',
  update_milestone: 'Updated milestone',
  delete_milestone: 'Deleted milestone',
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/audit?limit=${limit}`);
      setLogs(Array.isArray(data) ? data : []);
    } catch { setLogs([]); }
    setLoading(false);
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      displayName(l.actor).toLowerCase().includes(q) ||
      (l.actor?.email ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <header className="card-static p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">Admin</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Audit Trail</h2>
            <p className="mt-1 text-sm text-slate-500">Full history of all significant system actions.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Show last</label>
            <select value={limit} onChange={e => setLimit(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:border-sky-400 focus:outline-none">
              {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="card px-5 py-3 flex items-center gap-3">
        <svg className="h-4 w-4 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by action, entity, or user…" className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none flex-1" />
        <span className="text-xs text-slate-400">{filtered.length} entries</span>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading audit log…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-400">No audit entries found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Time', 'Actor', 'Action', 'Entity', 'Details'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDt(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700 whitespace-nowrap">{displayName(log.actor)}</p>
                      <p className="text-[10px] text-slate-400">{log.actor?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap ${actionColor(log.action)}`}>
                        {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {log.entity}
                      {log.entityId && <span className="ml-1 text-[10px] text-slate-400">#{log.entityId.slice(0, 8)}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {log.data ? JSON.stringify(log.data).slice(0, 80) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
