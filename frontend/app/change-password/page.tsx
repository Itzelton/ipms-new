"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/auth-context';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';
const LOCAL_TOKEN_KEY = 'ipms_local_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_TOKEN_KEY);
}

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // If already logged in and doesn't need to change password, redirect home
  useEffect(() => {
    if (user && !user.mustChangePassword) {
      const path = user.role === 'ADMIN' ? '/admin' : user.role === 'SUPERVISOR' ? '/supervisor' : '/student';
      window.location.href = path;
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (next === current) {
      setError('New password must be different from your current password.');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(json?.message) ? json.message[0] : (json?.message || 'Failed to change password');
        setError(msg);
        return;
      }

      setDone(true);
      // Short pause so the user sees the success message, then redirect
      setTimeout(() => {
        const path = user?.role === 'ADMIN' ? '/admin' : user?.role === 'SUPERVISOR' ? '/supervisor' : '/student';
        window.location.href = path;
      }, 2000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg mb-4">
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set your password</h1>
          <p className="mt-2 text-sm text-slate-500">
            {user?.name ? `Welcome, ${user.name}.` : 'Welcome.'} You must set a personal password before you can continue.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-800">Password updated!</p>
              <p className="text-sm text-slate-400">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Default password notice */}
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3">
                <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Your default password is <span className="font-mono font-semibold">Welcome@1234</span>. Enter it as your current password and choose a new one.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Current (default) password
                </label>
                <input
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                  placeholder="Welcome@1234"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {error && (
                <p className="rounded-2xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition"
              >
                {loading ? 'Saving…' : 'Set new password'}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full text-xs text-slate-400 hover:text-slate-600 transition"
              >
                Sign out instead
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
