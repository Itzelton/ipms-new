"use client";
import React, { useState } from 'react';
import { useAuth } from '../auth/auth-context';

const TIMEZONES = [
  'UTC',
  'Africa/Accra', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Cairo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney',
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY  —  29/06/2026' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY  —  06/29/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD  —  2026-06-29' },
];

const LANGUAGES = [
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-US', label: 'English (US)' },
];

export default function AccountSection() {
  const { logout } = useAuth() as any;

  const [timezone,   setTimezone]   = useState('Africa/Accra');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [language,   setLanguage]   = useState('en-GB');
  const [saved,      setSaved]      = useState(false);

  const [showDelete,     setShowDelete]     = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState('');

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      {/* Regional */}
      <div className="card p-6 space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Regional Preferences
        </p>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Timezone</label>
          <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Date Format</label>
          <select className="input" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
            {DATE_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Language</label>
          <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Saved
            </span>
          )}
          <button onClick={handleSave} className="btn-primary py-2 px-5">
            Save Preferences
          </button>
        </div>
      </div>

      {/* Sign out */}
      <div className="card p-6">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Session</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-slate-900">Sign out</p>
            <p className="mt-0.5 text-[12px] text-slate-500">End your current session on this device.</p>
          </div>
          <button
            onClick={() => logout?.()}
            className="flex-shrink-0 rounded-xl bg-slate-100 px-4 py-2 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6" style={{ borderColor: 'rgba(254,202,202,0.80)' }}>
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-rose-400">
          Danger Zone
        </p>

        {!showDelete ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-slate-900">Delete Account</p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Permanently remove your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDelete(true)}
              className="flex-shrink-0 rounded-xl bg-rose-50 px-4 py-2 text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-100"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-rose-50 px-4 py-3">
              <p className="text-[12px] font-semibold text-rose-800">
                This action is permanent and cannot be undone.
              </p>
              <p className="mt-0.5 text-[12px] text-rose-600">
                All projects, submissions, and data linked to your account will be deleted.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">
                Type <span className="font-mono text-rose-600">DELETE</span> to confirm
              </label>
              <input
                className="input"
                style={{ borderColor: 'rgba(252,165,165,0.7)' }}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                className="btn-secondary py-2 px-4"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== 'DELETE'}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-40"
              >
                Delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
