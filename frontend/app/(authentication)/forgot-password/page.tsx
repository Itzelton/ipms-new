"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Check your email</h2>
          <p className="text-slate-500 text-sm">
            We sent a password reset link to <strong className="text-slate-700">{email}</strong>. Click the link in the email to set a new password.
          </p>
          <p className="text-xs text-slate-400">Didn&apos;t receive it? Check your spam folder or try again.</p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setSent(false)}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Try a different email
            </button>
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="mb-6 space-y-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Reset password</h1>
            <p className="mt-1.5 text-slate-500 text-sm">
              Enter the email address on your account and we&apos;ll send you a reset link.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 hover:bg-sky-700 disabled:opacity-50 transition"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
