"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../components/auth/auth-context';
import Link from 'next/link';

type Role = 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | null;

export default function RegisterPage() {
  const { register, verifyAccount, user, hydrated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');
  const [studentId, setStudentId] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<string | null>(null);

  // Once hydrated, redirect if already logged in
  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      const path = user.role === 'ADMIN' ? '/admin' : user.role === 'SUPERVISOR' ? '/supervisor' : '/student';
      window.location.href = path;
    }
  }, [user, hydrated]);

  // After verifyAccount sets the user, the useEffect above handles redirect
  useEffect(() => {
    if (verifying && user && needsVerification) {
      // Redirect will happen via the user effect above
    }
  }, [user, verifying, needsVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !name || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'STUDENT') {
      if (!course || !level || !studentId || !indexNumber) {
        setError('Please fill in all student fields');
        return;
      }
    }

    setLoading(true);
    try {
      if (role === 'STUDENT') {
        await register(email, password, name, role, course, level, studentId, indexNumber);
      } else {
        await register(email, password, name, role);
      }
    } catch (err: any) {
      if (err?.message === 'VERIFICATION_REQUIRED') {
        setNeedsVerification(email.trim().toLowerCase());
      } else {
        setError(err?.message || 'Unable to create account');
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
    } catch {
      setError('Verification failed. Please try again.');
      setVerifying(false);
    }
  };

  if (!hydrated) return null;

  // Verification screen
  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Verify your account</h2>
          <p className="mt-3 text-slate-600">
            Your account has been created for <strong>{needsVerification}</strong>. Click the button below to verify and activate your account.
          </p>
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700 mt-6 w-full sm:w-auto"
          >
            {verifying ? 'Verifying...' : 'Verify Account & Sign In'}
          </button>
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
              className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={role || 'STUDENT'}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400"
            >
              <option value="STUDENT">Student</option>
              <option value="SUPERVISOR">Lecturer / Supervisor</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {role === 'STUDENT' && (
            <fieldset className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <legend className="text-sm font-semibold text-slate-700">Student details</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Course</label>
                  <input
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="mt-1 block w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-sky-400"
                    placeholder="e.g., BSc Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Level</label>
                  <input
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="mt-1 block w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-sky-400"
                    placeholder="e.g., 400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Student ID</label>
                  <input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="mt-1 block w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-sky-400"
                    placeholder="e.g., STU123456"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Index Number</label>
                  <input
                    value={indexNumber}
                    onChange={(e) => setIndexNumber(e.target.value)}
                    className="mt-1 block w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 focus:border-sky-400"
                    placeholder="e.g., 00123456"
                  />
                </div>
              </div>
            </fieldset>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400"
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-400"
              placeholder="Repeat your password"
            />
          </div>

          <div>
            <button disabled={loading} className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700 w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <p className="mt-3 text-sm text-slate-500 text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="underline">terms of use</a> and{' '}
              <a href="#" className="underline">privacy policy</a>.
            </p>
          </div>
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
