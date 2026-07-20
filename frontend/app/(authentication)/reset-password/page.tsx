"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the user lands from the reset email link.
    // It reads the token from the URL hash automatically.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Also check if a session already exists (handles page reload after recovery link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    // Show expired message if no recovery event fires within 5 seconds
    const timeout = setTimeout(() => {
      setExpired(prev => {
        if (!ready) return true;
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [ready]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Update password in Supabase
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) throw sbError;

      // Sync new password hash to local backend so local login still works
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch(`${API}/auth/set-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ newPassword: password }),
        });
      }

      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Password updated</h2>
          <p className="text-slate-500 text-sm">Your password has been changed successfully. You can now sign in with your new password.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition mt-2"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (expired && !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Link expired</h2>
          <p className="text-slate-500 text-sm">This password reset link is invalid or has expired. Request a new one.</p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition mt-2"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900">Set new password</h1>
          <p className="mt-1.5 text-slate-500 text-sm">Choose a strong password for your account.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 hover:bg-sky-700 disabled:opacity-50 transition"
          >
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
