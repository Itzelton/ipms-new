"use client";
import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../services/api';

type Meeting = {
  id: string;
  title: string;
  scheduledAt: string;
  location?: string;
  agenda?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  outcome?: string;
  supervisor: { id: string; preferredName?: string; firstName?: string; lastName?: string; email: string };
};

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED:  'bg-sky-100 text-sky-700',
  COMPLETED:  'bg-emerald-100 text-emerald-700',
  CANCELLED:  'bg-slate-100 text-slate-500',
};

const STATUS_DOT: Record<string, string> = {
  SCHEDULED:  'bg-sky-400',
  COMPLETED:  'bg-emerald-400',
  CANCELLED:  'bg-slate-300',
};

function svName(sv: Meeting['supervisor']) {
  return sv.preferredName || [sv.firstName, sv.lastName].filter(Boolean).join(' ') || sv.email;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const TABS = ['All', 'Scheduled', 'Completed', 'Cancelled'] as const;
type Tab = typeof TABS[number];

function isUrl(str: string) {
  return /^https?:\/\//i.test(str.trim());
}

export default function StudentMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('All');
  const [selected, setSelected] = useState<Meeting | null>(null);

  useEffect(() => {
    apiGet('/meetings')
      .then((data) => setMeetings(Array.isArray(data) ? data : []))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = meetings.find((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt) > new Date());

  const filtered = meetings.filter((m) => {
    if (tab === 'All') return true;
    return m.status === tab.toUpperCase();
  });

  const counts = {
    scheduled: meetings.filter(m => m.status === 'SCHEDULED').length,
    completed:  meetings.filter(m => m.status === 'COMPLETED').length,
    cancelled:  meetings.filter(m => m.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="card w-full max-w-lg p-6 space-y-5" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Meeting details</p>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{selected.title}</h3>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1 ${STATUS_STYLES[selected.status]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[selected.status]}`} />
                {selected.status.charAt(0) + selected.status.slice(1).toLowerCase()}
              </span>
            </div>

            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden text-sm">
              {/* Date & time */}
              <div className="flex gap-3 px-4 py-3">
                <span className="w-28 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 pt-0.5">Date & Time</span>
                <span className="text-slate-700">{fmtDate(selected.scheduledAt)} at {fmtTime(selected.scheduledAt)}</span>
              </div>

              {/* Supervisor */}
              <div className="flex gap-3 px-4 py-3">
                <span className="w-28 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 pt-0.5">Supervisor</span>
                <span className="text-slate-700">{svName(selected.supervisor)}</span>
              </div>

              {/* Location / Link */}
              {selected.location && (
                <div className="flex gap-3 px-4 py-3">
                  <span className="w-28 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 pt-0.5">
                    {isUrl(selected.location) ? 'Meeting Link' : 'Location'}
                  </span>
                  {isUrl(selected.location) ? (
                    <a href={selected.location} target="_blank" rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 underline underline-offset-2 break-all font-medium">
                      {selected.location}
                    </a>
                  ) : (
                    <span className="text-slate-700">{selected.location}</span>
                  )}
                </div>
              )}

              {/* Agenda */}
              {selected.agenda && (
                <div className="flex gap-3 px-4 py-3">
                  <span className="w-28 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 pt-0.5">Agenda</span>
                  <span className="text-slate-600 whitespace-pre-wrap">{selected.agenda}</span>
                </div>
              )}

              {/* Outcome */}
              {selected.outcome && (
                <div className="flex gap-3 px-4 py-3 bg-emerald-50">
                  <span className="w-28 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 pt-0.5">Outcome</span>
                  <span className="text-emerald-800 whitespace-pre-wrap">{selected.outcome}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setSelected(null)}
                className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="card-static p-6">
        <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">Meetings</span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">My Meetings</h2>
        <p className="mt-1 text-sm text-slate-500">Meetings scheduled by your supervisor.</p>
      </header>

      {/* Upcoming callout */}
      {upcoming && (
        <div onClick={() => setSelected(upcoming)} className="card p-5 cursor-pointer border-sky-200 bg-sky-50 hover:shadow-md transition-shadow dark:border-sky-900/40 dark:bg-sky-900/10">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-100">
              <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-500">Upcoming meeting</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">{upcoming.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {fmtDate(upcoming.scheduledAt)} at {fmtTime(upcoming.scheduledAt)}
                {upcoming.location && <> &middot; {upcoming.location}</>}
              </p>
              {upcoming.agenda && (
                <p className="mt-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs text-slate-600 dark:border-sky-900/40 dark:bg-slate-800/60 dark:text-slate-300">{upcoming.agenda}</p>
              )}
            </div>
          </div>
        </div>
      )}

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
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1 w-fit" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-10 text-center text-sm text-slate-400">Loading meetings…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-500">No {tab !== 'All' ? tab.toLowerCase() : ''} meetings yet.</p>
          <p className="mt-1 text-xs text-slate-400">Your supervisor will schedule meetings here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} onClick={() => setSelected(m)}
              className="card p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5 cursor-pointer hover:shadow-md transition-shadow">
              {/* Date badge */}
              <div className="flex-shrink-0 text-center sm:w-16">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {new Date(m.scheduledAt).toLocaleDateString('en-GB', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 leading-none mt-0.5">
                    {new Date(m.scheduledAt).getDate()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{fmtTime(m.scheduledAt)}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 ${STATUS_STYLES[m.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[m.status]}`} />
                    {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Supervisor: {svName(m.supervisor)}
                  {m.location && <> &middot; {m.location}</>}
                </p>
                {m.agenda && (
                  <p className="mt-2 text-[12px] text-slate-500 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                    <span className="font-medium text-slate-600">Agenda: </span>{m.agenda}
                  </p>
                )}
                {m.outcome && (
                  <p className="mt-2 text-[12px] text-emerald-700 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <span className="font-medium">Outcome: </span>{m.outcome}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
