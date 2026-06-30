"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../components/auth/auth-context';

export default function LoginPage() {
  const { login, user, hydrated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      const path = user.role === 'ADMIN' ? '/admin' : user.role === 'SUPERVISOR' ? '/supervisor' : '/student';
      window.location.href = path;
    }
  }, [user, hydrated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="mb-6 space-y-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-800">
            Welcome to IPMS
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
            <p className="mt-2 text-slate-600">Access your dashboard, view projects, and stay on top of submissions.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400 focus:outline-none"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400 focus:outline-none"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700 w-full sm:w-auto disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-sky-700 hover:text-sky-800">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
