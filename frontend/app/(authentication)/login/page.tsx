"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../components/auth/auth-context';

export default function LoginPage() {
  const { login, verifyAccount, user, hydrated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Once hydrated, redirect if already logged in
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
    setNeedsVerification(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // login sets user in state, useEffect above will redirect
    } catch (err: any) {
      const msg = err?.message || 'Unable to sign in';
      if (msg.toLowerCase().includes('not verified') || msg.toLowerCase().includes('verification')) {
        setNeedsVerification(email.trim().toLowerCase());
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (!needsVerification) return;
    setVerifying(true);
    try {
      verifyAccount(needsVerification);
      // verifyAccount sets user, useEffect above will redirect
    } catch {
      setError('Verification failed.');
      setVerifying(false);
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

        {needsVerification ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Account not verified</h2>
            <p className="text-sm text-slate-600">
              Your account for <strong>{needsVerification}</strong> needs to be verified before you can sign in.
            </p>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700 w-full"
            >
              {verifying ? 'Verifying...' : 'Verify Account & Sign In'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button disabled={loading} className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700 w-full sm:w-auto">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <a href="#" className="text-sm font-medium text-sky-600 hover:text-sky-700">
                Forgot password?
              </a>
            </div>
            <p className="text-sm text-slate-500">
              For local testing, use password <strong>password123</strong> and an email containing admin, supervisor, or student.
            </p>
            <div className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-sky-700 hover:text-sky-800">
                Create one
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
