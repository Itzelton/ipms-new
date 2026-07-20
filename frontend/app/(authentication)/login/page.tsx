"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../../components/auth/auth-context';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

type DirEntry = { name: string; email: string; role: string };
type LoginRole = 'STUDENT' | 'SUPERVISOR' | 'ADMIN';

const ROLES: { value: LoginRole; label: string }[] = [
  { value: 'STUDENT',    label: 'Student'   },
  { value: 'SUPERVISOR', label: 'Lecturer'  },
  { value: 'ADMIN',      label: 'Admin'     },
];

export default function LoginPage() {
  const { login, user, hydrated } = useAuth();
  const searchParams = useSearchParams();

  const [directory, setDirectory] = useState<DirEntry[]>([]);
  const [loginRole, setLoginRole] = useState<LoginRole>('STUDENT');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DirEntry | null>(null);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      const next = searchParams.get('next');
      const path = next || (user.role === 'ADMIN' ? '/admin' : user.role === 'SUPERVISOR' ? '/supervisor' : '/student');
      window.location.href = path;
    }
  }, [user, hydrated, searchParams]);

  useEffect(() => {
    fetch(`${API}/auth/directory`)
      .then(r => r.json())
      .then(r => {
        const list: DirEntry[] = Array.isArray(r) ? r : (r?.data ?? []);
        setDirectory(list.filter(u => u.name && u.email));
      })
      .catch(() => {});
  }, []);

  // Reset picker when role changes
  useEffect(() => {
    setQuery('');
    setSelected(null);
    setOpen(false);
  }, [loginRole]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Only show users matching the selected role
  const roleFiltered = useMemo(
    () => directory.filter(u => u.role === loginRole),
    [directory, loginRole],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return roleFiltered.slice(0, 10);
    const q = query.toLowerCase();
    return roleFiltered.filter(u => u.name.toLowerCase().includes(q)).slice(0, 10);
  }, [query, roleFiltered]);

  function selectUser(u: DirEntry) {
    setSelected(u);
    setQuery(u.name);
    setOpen(false);
  }

  function handleQueryChange(v: string) {
    setQuery(v);
    setSelected(null);
    setOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selected) { setError('Please select your name from the list.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      await login(selected.email, password);
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Check your password and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-semibold text-sky-800">
            Welcome to IPMS
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
            <p className="mt-1.5 text-slate-500 text-sm">Access your dashboard, view projects, and stay on top of submissions.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Role selector */}
          <div className="space-y-1.5">
            <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setLoginRole(r.value)}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                    loginRole === r.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name picker — filtered to selected role */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              {loginRole === 'SUPERVISOR' ? 'Your name' : loginRole === 'ADMIN' ? 'Your name' : 'Your name'}
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onFocus={() => setOpen(true)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm focus:border-sky-400 focus:outline-none"
                placeholder={
                  loginRole === 'SUPERVISOR'
                    ? 'Search lecturers…'
                    : loginRole === 'ADMIN'
                    ? 'Search admins…'
                    : 'Search students…'
                }
                autoComplete="off"
              />
              <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>

              {open && filtered.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-20 mt-1 w-full rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden"
                >
                  {filtered.map(u => (
                    <button
                      key={u.email}
                      type="button"
                      onMouseDown={() => selectUser(u)}
                      className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 transition"
                    >
                      <span className="text-sm font-medium text-slate-800">{u.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {open && filtered.length === 0 && query.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-2xl bg-white border border-slate-100 shadow-xl px-4 py-3">
                  <p className="text-sm text-slate-400">No {loginRole === 'SUPERVISOR' ? 'lecturers' : loginRole === 'ADMIN' ? 'admins' : 'students'} found matching "{query}"</p>
                </div>
              )}
            </div>

            {selected && (
              <p className="flex items-center gap-1.5 px-1 text-xs text-slate-400">
                <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Signing in as <span className="font-medium text-slate-600">{selected.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selected}
            className="w-full rounded-full bg-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 hover:bg-sky-700 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-sky-700 hover:text-sky-800">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
