"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/auth/auth-context';
import { apiGet, apiPost } from '../../../services/api';

type State = 'loading' | 'ready' | 'accepting' | 'done' | 'error';

const ROLE_LABELS: Record<string, string> = {
  REVIEWER: 'Reviewer',
  STUDENT: 'Student',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Admin',
  GUEST: 'Guest',
};

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const [state, setState] = useState<State>('loading');
  const [invite, setInvite] = useState<{ projectId: string; role: string; project: { id: string; title: string } } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      // Redirect to login with a return URL so they come back after signing in
      router.replace(`/login?next=/invite/${params.token}`);
      return;
    }
    apiGet(`/invites/${params.token}`)
      .then((data: any) => {
        setInvite(data);
        setState('ready');
      })
      .catch((err: any) => {
        setErrorMsg(err?.message || 'This invite link is invalid or has been revoked.');
        setState('error');
      });
  }, [hydrated, user, params.token]);

  async function handleAccept() {
    setState('accepting');
    try {
      const result = await apiPost(`/invites/${params.token}/accept`, {});
      setState('done');
      setTimeout(() => {
        const role = user?.role?.toLowerCase() ?? 'student';
        const dest = role === 'supervisor'
          ? `/supervisor/projects/${result.projectId}`
          : `/student/projects/${result.projectId}`;
        router.push(dest);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to accept invite. You may already be a collaborator.');
      setState('error');
    }
  }

  if (!hydrated || state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading invite...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center space-y-4">
          <div className="text-4xl">🔗</div>
          <h1 className="text-xl font-semibold text-gray-900">Invite unavailable</h1>
          <p className="text-gray-600 text-sm">{errorMsg}</p>
          <button
            onClick={() => router.push('/')}
            className="rounded bg-slate-700 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-semibold text-gray-900">You&apos;re in!</h1>
          <p className="text-gray-600 text-sm">Redirecting to the project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md w-full p-8 space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Project invitation</p>
          <h1 className="text-2xl font-semibold text-gray-900">{invite?.project?.title ?? 'A project'}</h1>
        </div>

        <p className="text-sm text-gray-600">
          You have been invited to collaborate on this project as a{' '}
          <span className="font-medium text-gray-800">
            {ROLE_LABELS[invite?.role ?? ''] ?? invite?.role}
          </span>
          . Accepting will add you as a collaborator and give you access to view and edit the project.
        </p>

        <div className="rounded bg-slate-50 px-4 py-3 text-sm text-gray-700">
          Signed in as <span className="font-medium">{user?.email}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={state === 'accepting'}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {state === 'accepting' ? 'Joining...' : 'Accept invitation'}
          </button>
          <button
            onClick={() => router.push('/')}
            className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
