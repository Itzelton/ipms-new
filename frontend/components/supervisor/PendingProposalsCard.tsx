"use client";
import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../services/api';

type Proposal = {
  id: string; title: string; description?: string; type: string; createdAt: string;
  proposalDocUrl?: string;
  student?: { id: string; firstName?: string; lastName?: string; email: string; preferredName?: string };
};

export default function PendingProposalsCard() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    try {
      const data = await apiGet('/projects/proposals');
      if (Array.isArray(data)) setProposals(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDecision(id: string, status: 'ACTIVE' | 'CANCELLED') {
    setActing(id);
    try {
      await apiPatch(`/projects/${id}/status`, { status });
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
    finally { setActing(null); }
  }

  if (!loading && proposals.length === 0) return null;

  function studentName(s?: Proposal['student']) {
    if (!s) return 'Unknown student';
    return s.preferredName || [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email;
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Pending Proposals</h3>
        {proposals.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{proposals.length}</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <ul className="space-y-3">
          {proposals.map((p) => (
            <li key={p.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-800 leading-snug">{p.title}</p>
                <span className="flex-shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-500">{p.type.charAt(0) + p.type.slice(1).toLowerCase()}</span>
              </div>
              <p className="text-[12px] text-slate-500 mb-1">From: <span className="font-medium text-slate-700">{studentName(p.student)}</span></p>
              {p.description && <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{p.description}</p>}
              {p.proposalDocUrl && (
                <a
                  href={p.proposalDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 transition no-underline"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32" />
                  </svg>
                  View document
                </a>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDecision(p.id, 'ACTIVE')}
                  disabled={acting === p.id}
                  className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecision(p.id, 'CANCELLED')}
                  disabled={acting === p.id}
                  className="flex-1 rounded-lg border border-rose-200 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
