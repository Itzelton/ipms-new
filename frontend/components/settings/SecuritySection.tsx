"use client";
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SecuritySection() {
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPw, setShowPw]       = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setMsg({ type: 'success', text: 'Password updated successfully.' });
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  }

  const inputType = showPw ? 'text' : 'password';

  return (
    <div className="space-y-4">
      {/* Password change */}
      <div className="card p-6">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Change Password
        </p>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">New Password</label>
              <input
                type={inputType}
                className="input"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Confirm New Password</label>
              <input
                type={inputType}
                className="input"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="rounded"
              checked={showPw}
              onChange={(e) => setShowPw(e.target.checked)}
            />
            <span className="text-[12px] text-slate-600">Show passwords</span>
          </label>

          {msg && (
            <div
              className={`rounded-xl px-4 py-3 text-[12px] font-medium ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="flex justify-end pt-1 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving || !newPw || !confirmPw}
              className="btn-primary py-2 px-5 disabled:opacity-60"
            >
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Sessions */}
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Active Sessions
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          <li className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-800">Current browser session</p>
                <p className="text-[11px] text-slate-400">Active now</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              This device
            </span>
          </li>
        </ul>
      </div>

      {/* Two-factor (placeholder) */}
      <div className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-2">
              Two-Factor Authentication
            </p>
            <p className="text-[13px] font-medium text-slate-800">Add an extra layer of security</p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Require a verification code when signing in from a new device.
            </p>
          </div>
          <button className="flex-shrink-0 rounded-xl bg-slate-100 px-4 py-2 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-200">
            Set up 2FA
          </button>
        </div>
      </div>
    </div>
  );
}
