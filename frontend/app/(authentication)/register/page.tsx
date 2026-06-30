"use client";
import React, { useEffect, useState } from 'react';
import { useAuth, Role } from '../../../components/auth/auth-context';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, user, hydrated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

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

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, name.trim(), role);
    } catch (err: any) {
      if (err?.message === 'CHECK_EMAIL') {
        setCheckEmail(true);
      } else {
        setError(err?.message || 'Unable to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Check your email</h2>
          <p className="text-slate-600">
            A confirmation link has been sent to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700 mt-4">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="card p-8 w-full max-w-lg">
        <div className="mb-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800">
            New account
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Create your IPMS account</h1>
            <p className="mt-2 text-slate-600">Register as a student, lecturer, or admin.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={role || 'STUDENT'}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400 focus:outline-none"
            >
              <option value="STUDENT">Student</option>
              <option value="SUPERVISOR">Lecturer / Supervisor</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400 focus:outline-none"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400 focus:outline-none"
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700 w-full disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
