"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPatch, apiDelete } from '../../../services/api';

type PendingUser = { id: string; email: string; firstName?: string; lastName?: string; preferredName?: string; isActive: boolean; roles: string[]; createdAt: string };

function displayName(u: PendingUser) {
  return u.preferredName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminApprovalsPage() {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all inactive users — these are the "pending approval" accounts
      const data = await apiGet('/users?role=ALL');
      const all = Array.isArray(data) ? data : (data?.items ?? []);
      setPending(all.filter((u: any) => u.isActive === false));
    } catch { setPending([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  async function approve(id: string) {
    setProcessing(id);
    try {
      await apiPatch(`/users/${id}`, { isActive: true });
      showToast('Account approved.');
      await load();
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
    setProcessing(null);
  }

  async function reject(id: string) {
    setProcessing(id);
    try {
      await apiDelete(`/users/${id}`);
      showToast('Account rejected and removed.');
      await load();
    } catch (e: any) { showToast(e?.message || 'Failed to reject.'); }
    setProcessing(null);
  }

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">{toast}</div>}

      <header className="card-static p-6">
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">Admin</span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Account Approvals</h2>
        <p className="mt-1 text-sm text-slate-500">Review and approve pending accounts awaiting activation.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{loading ? '—' : pending.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Students</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '—' : pending.filter(u => u.roles?.includes('STUDENT')).length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Supervisors</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '—' : pending.filter(u => u.roles?.includes('SUPERVISOR')).length}</p>
        </div>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading…</div>
      ) : pending.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 mx-auto mb-4">
            <svg className="h-7 w-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">All caught up!</p>
          <p className="mt-1 text-xs text-slate-400">No pending account approvals.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-700">Pending accounts ({pending.length})</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {pending.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-sm font-bold text-white">
                    {displayName(u).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{displayName(u)}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {(u.roles ?? []).map((r: string) => (
                        <span key={r} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{r}</span>
                      ))}
                      <span className="text-[10px] text-slate-400">Registered {fmtDate(u.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => approve(u.id)}
                    disabled={processing === u.id}
                    className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 transition"
                  >
                    {processing === u.id ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => reject(u.id)}
                    disabled={processing === u.id}
                    className="rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60 transition"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
