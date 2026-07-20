"use client";
import React, { useEffect, useState } from 'react';
import { useAuth, Role } from '../../../components/auth/auth-context';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

type DirEntry = { name: string; email: string; role: string };

// Role selector card
function RoleCard({ value, current, onClick, icon, title, desc }: {
  value: Role; current: Role; onClick: () => void;
  icon: React.ReactNode; title: string; desc: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border-2 px-4 py-3 text-left transition ${
        active
          ? 'border-sky-500 bg-sky-50'
          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${active ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-semibold ${active ? 'text-sky-800' : 'text-slate-700'}`}>{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
        </div>
        {active && (
          <svg className="ml-auto h-5 w-5 text-sky-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
}

export default function RegisterPage() {
  const { register, user, hydrated } = useAuth();
  const [role, setRole] = useState<Role>('STUDENT');

  // Supervisor-specific state
  const [supervisors, setSupervisors] = useState<DirEntry[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState<DirEntry | null>(null);

  // Student / shared state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  // Fetch supervisor list when SUPERVISOR role is selected
  useEffect(() => {
    if (role !== 'SUPERVISOR') return;
    if (supervisors.length > 0) return;
    fetch(`${API}/auth/directory`)
      .then(r => r.json())
      .then(r => {
        const list: DirEntry[] = Array.isArray(r) ? r : (r?.data ?? []);
        setSupervisors(list.filter(u => u.role === 'SUPERVISOR'));
      })
      .catch(() => {});
  }, [role, supervisors.length]);

  // Reset supervisor selection when role changes
  useEffect(() => {
    setSelectedSupervisor(null);
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'SUPERVISOR') {
      if (!selectedSupervisor) { setError('Please select your name from the list.'); return; }
      if (!password) { setError('Please enter your password.'); return; }
      setLoading(true);
      try {
        // Supervisors already exist; register falls back to login for existing accounts
        await register(selectedSupervisor.email, password, selectedSupervisor.name, 'SUPERVISOR');
      } catch (err: any) {
        setError(err?.message || 'Unable to sign in. Check your password and try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Student / Admin
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
            <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Check your email</h2>
          <p className="text-slate-600 text-sm">
            A confirmation link has been sent to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition mt-2">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="card p-8 w-full max-w-lg">
        <div className="mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-semibold text-sky-800">
            New account
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Create your IPMS account</h1>
            <p className="mt-1.5 text-slate-500 text-sm">Choose your role to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">I am a…</label>
            <div className="space-y-2">
              <RoleCard
                value="STUDENT" current={role} onClick={() => setRole('STUDENT')}
                title="Student" desc="Track your project, milestones, and submissions"
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>}
              />
              <RoleCard
                value="SUPERVISOR" current={role} onClick={() => setRole('SUPERVISOR')}
                title="Lecturer / Supervisor" desc="Supervise student projects and review submissions"
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
            </div>
          </div>

          {/* ── SUPERVISOR FLOW ── */}
          {role === 'SUPERVISOR' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select your name</label>
                {supervisors.length === 0 ? (
                  <p className="text-sm text-slate-400 py-3 text-center">Loading lecturers…</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
                    {supervisors.map(sv => (
                      <button
                        key={sv.email}
                        type="button"
                        onClick={() => setSelectedSupervisor(sv)}
                        className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                          selectedSupervisor?.email === sv.email
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <p className={`text-sm font-semibold ${selectedSupervisor?.email === sv.email ? 'text-violet-800' : 'text-slate-800'}`}>
                          {sv.name}
                        </p>
                        {selectedSupervisor?.email === sv.email && (
                          <p className="text-[11px] text-violet-500 mt-0.5 truncate">{sv.email}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedSupervisor && (
                  <p className="mt-2 flex items-center gap-1.5 px-1 text-xs text-slate-400">
                    <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Account email: <span className="font-medium text-slate-600">{selectedSupervisor.email}</span>
                  </p>
                )}
              </div>

              {selectedSupervisor && (
                <>
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3">
                    <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Your default password is <span className="font-mono font-semibold">Welcome@1234</span>. Enter it below — you'll be asked to set a personal password immediately after.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Welcome@1234"
                      required
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STUDENT FLOW ── */}
          {role === 'STUDENT' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          {(role === 'STUDENT' || (role === 'SUPERVISOR' && selectedSupervisor)) && (
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 hover:bg-sky-700 disabled:opacity-60 transition"
            >
              {loading
                ? (role === 'SUPERVISOR' ? 'Signing in…' : 'Creating account…')
                : (role === 'SUPERVISOR' ? 'Continue' : 'Create Account')}
            </button>
          )}

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
