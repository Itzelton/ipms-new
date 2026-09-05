"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

type State = 'loading' | 'ready' | 'saving' | 'done' | 'expired' | 'error';

export default function SetPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');

    if (!accessToken || !(type === 'invite' || type === 'recovery' || type === 'signup')) {
      setState('error');
      return;
    }

    // Establish session using both tokens so Supabase can auto-refresh if needed
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken ?? '' })
      .then(({ data, error }) => {
        if (error || !data.session) {
          setState('expired');
          return;
        }
        setSessionToken(data.session.access_token);
        setState('ready');
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setState('saving');
    try {
      // 1. Update password in Supabase auth
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) throw new Error(sbError.message);

      // 2. Update password in local DB so local login works too
      await fetch(`${API}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ newPassword: password }),
      });

      // 3. Sign out — user will log in fresh
      await supabase.auth.signOut();

      setState('done');
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to set password. Please try again.');
      setState('ready');
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">Verifying your link…</p>
      </div>
    );
  }

  if (state === 'expired' || state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center space-y-4">
          <div className="text-4xl">{state === 'expired' ? '⏰' : '🔗'}</div>
          <h1 className="text-xl font-semibold text-slate-900">
            {state === 'expired' ? 'Invite link expired' : 'Link unavailable'}
          </h1>
          <p className="text-sm text-slate-500">
            {state === 'expired'
              ? 'This invite link has expired. Please ask your admin to send a new one.'
              : 'This link is invalid or has already been used. Please contact your admin.'}
          </p>
          <button onClick={() => router.push('/login')} className="rounded-xl bg-slate-800 px-6 py-2 text-sm font-medium text-white hover:bg-slate-900">
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg mb-4">
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set your password</h1>
          <p className="mt-2 text-sm text-slate-500">Choose a password to activate your account.</p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
          {state === 'done' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-800">Password set!</p>
              <p className="text-sm text-slate-400">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {error && (
                <p className="rounded-2xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={state === 'saving'}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:from-sky-700 hover:to-indigo-700 disabled:opacity-60 transition"
              >
                {state === 'saving' ? 'Saving…' : 'Activate account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
