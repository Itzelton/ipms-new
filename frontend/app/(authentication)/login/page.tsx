"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../../components/auth/auth-context';
import { apiPost } from '../../../services/api';

export default function LoginPage() {
  const { login, user, hydrated } = useAuth();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  // Admin registration state
  const [showRegister, setShowRegister] = useState(false);
  const [reg, setReg] = useState({ name: '', email: '', password: '', confirm: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      const next = searchParams.get('next');
      const path = next || (user.role === 'ADMIN' ? '/admin' : user.role === 'SUPERVISOR' ? '/supervisor' : '/student');
      window.location.href = path;
    }
  }, [user, hydrated, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingApproval(false);
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const msg: string = err?.message || '';
      if (msg.toLowerCase().includes('inactive')) {
        setPendingApproval(true);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!reg.name.trim()) { setRegError('Please enter your full name.'); return; }
    if (!reg.email.trim()) { setRegError('Please enter your email address.'); return; }
    if (reg.password.length < 8) { setRegError('Password must be at least 8 characters.'); return; }
    if (reg.password !== reg.confirm) { setRegError('Passwords do not match.'); return; }
    setRegLoading(true);
    try {
      await apiPost('/auth/register-admin', { name: reg.name.trim(), email: reg.email.trim(), password: reg.password });
      setRegSuccess(true);
    } catch (err: any) {
      setRegError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  if (!hydrated) return null;

  const inputCls = 'w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="mb-6 space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="IPMS" className="mx-auto block w-full h-auto max-h-56 object-contain" />
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
            <p className="mt-1.5 text-slate-500 text-sm">Access your dashboard, view projects, and stay on top of submissions.</p>
          </div>
        </div>

        {/* Login error */}
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Pending approval notice */}
        {pendingApproval && (
          <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Account pending approval</p>
            <p className="mt-0.5">Your admin account has not been activated yet. An existing admin will review and approve your request.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 hover:bg-sky-700 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in… (this may take a moment)' : 'Sign in'}
          </button>
        </form>

        {/* Admin registration */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          {!showRegister ? (
            <p className="text-center text-sm text-slate-500">
              Are you an admin?{' '}
              <button
                onClick={() => { setShowRegister(true); setRegSuccess(false); setRegError(null); }}
                className="font-semibold text-sky-700 hover:text-sky-800 bg-transparent border-none cursor-pointer p-0"
              >
                Register here
              </button>
            </p>
          ) : regSuccess ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4 text-sm text-emerald-800 text-center space-y-1">
              <p className="font-semibold">Registration submitted!</p>
              <p>An existing admin will review and activate your account. You can then sign in above.</p>
              <button
                onClick={() => { setShowRegister(false); setRegSuccess(false); }}
                className="mt-2 text-xs text-emerald-700 underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Register as Admin</p>
                <button
                  onClick={() => { setShowRegister(false); setRegError(null); }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-slate-500">Your account will be inactive until an existing admin approves it.</p>

              {regError && (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{regError}</div>
              )}

              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  value={reg.name}
                  onChange={e => setReg(r => ({ ...r, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Full name"
                  autoComplete="name"
                />
                <input
                  type="email"
                  value={reg.email}
                  onChange={e => setReg(r => ({ ...r, email: e.target.value }))}
                  className={inputCls}
                  placeholder="Email address"
                  autoComplete="email"
                />
                <input
                  type="password"
                  value={reg.password}
                  onChange={e => setReg(r => ({ ...r, password: e.target.value }))}
                  className={inputCls}
                  placeholder="Password (min. 8 characters)"
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  value={reg.confirm}
                  onChange={e => setReg(r => ({ ...r, confirm: e.target.value }))}
                  className={inputCls}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full rounded-full bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50 transition"
                >
                  {regLoading ? 'Submitting…' : 'Submit registration'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
