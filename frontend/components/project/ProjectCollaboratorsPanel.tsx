"use client";
import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '../../services/api';

interface CollaboratorUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface Collaborator {
  id: string;
  role: string;
  assignedAt: string;
  user: CollaboratorUser;
}

interface Invite {
  id: string;
  token: string;
  role: string;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

function displayName(c: Collaborator): string {
  const u = c.user;
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return name || u.email;
}

const ROLE_LABELS: Record<string, string> = {
  REVIEWER: 'Reviewer',
  STUDENT: 'Student',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Admin',
  GUEST: 'Guest',
};

const ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

export default function ProjectCollaboratorsPanel({ projectId }: { projectId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('REVIEWER');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const [inviteRole, setInviteRole] = useState('REVIEWER');
  const [inviteExpiry, setInviteExpiry] = useState('7');
  const [generating, setGenerating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);

  async function load() {
    const [collab, inv] = await Promise.allSettled([
      apiGet(`/projects/${projectId}/collaborators`),
      apiGet(`/projects/${projectId}/invites`),
    ]);
    setCollaborators(collab.status === 'fulfilled' && Array.isArray(collab.value) ? collab.value : []);
    setInvites(inv.status === 'fulfilled' && Array.isArray(inv.value) ? inv.value : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [projectId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      await apiPost(`/projects/${projectId}/collaborators`, { email: newEmail.trim(), role: newRole });
      setNewEmail('');
      await load();
    } catch (err: any) {
      setAddError(err?.message || 'No account found with that email address.');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    try {
      await apiDelete(`/projects/${projectId}/collaborators/${userId}`);
      await load();
    } catch {
      // ignore
    } finally {
      setRemovingId(null);
    }
  }

  async function handleGenerateInvite(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    try {
      await apiPost(`/projects/${projectId}/invites`, {
        role: inviteRole,
        expiresInDays: inviteExpiry ? Number(inviteExpiry) : undefined,
      });
      await load();
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevokeInvite(token: string) {
    try {
      await apiDelete(`/projects/${projectId}/invites/${token}`);
      await load();
    } catch {
      // ignore
    }
  }

  function handleCopy(token: string) {
    const link = `${ORIGIN}/invite/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  }

  if (loading) {
    return <div className="py-4 text-sm text-gray-500">Loading collaborators...</div>;
  }

  return (
    <div className="space-y-8">

      {/* Collaborators list */}
      <section>
        <h4 className="mb-3 text-sm font-semibold text-gray-700">
          {collaborators.length === 0
            ? 'No collaborators yet'
            : `${collaborators.length} Collaborator${collaborators.length !== 1 ? 's' : ''}`}
        </h4>
        {collaborators.length > 0 && (
          <ul className="divide-y divide-gray-100 rounded border border-gray-100">
            {collaborators.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{displayName(c)}</p>
                  <p className="text-xs text-gray-500">
                    {c.user?.email}
                    <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                      {ROLE_LABELS[c.role] ?? c.role}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(c.user?.id)}
                  disabled={removingId === c.user?.id}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {removingId === c.user?.id ? 'Removing...' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add by email */}
      <form onSubmit={handleAdd} className="space-y-3 rounded border border-dashed border-gray-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add by email</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="rounded border px-2 py-1.5 text-sm"
          >
            <option value="REVIEWER">Reviewer</option>
            <option value="STUDENT">Student</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="GUEST">Guest</option>
          </select>
          <button
            type="submit"
            disabled={adding || !newEmail.trim()}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
        {addError && <p className="text-xs text-red-600">{addError}</p>}
      </form>

      {/* Invite links */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Invite links</h4>

        {invites.length > 0 && (
          <ul className="divide-y divide-gray-100 rounded border border-gray-100">
            {invites.map((inv) => {
              const link = `${ORIGIN}/invite/${inv.token}`;
              const expired = inv.expiresAt && new Date(inv.expiresAt) < new Date();
              return (
                <li key={inv.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                        {ROLE_LABELS[inv.role] ?? inv.role}
                      </span>
                      {expired && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">Expired</span>
                      )}
                      <span className="text-xs text-gray-400">
                        Used {inv.usedCount} time{inv.usedCount !== 1 ? 's' : ''}
                        {inv.expiresAt && !expired && ` · expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-gray-500">{link}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleCopy(inv.token)}
                      className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                    >
                      {copiedToken === inv.token ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleRevokeInvite(inv.token)}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Revoke
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form onSubmit={handleGenerateInvite} className="flex flex-wrap gap-2">
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="rounded border px-2 py-1.5 text-sm"
          >
            <option value="REVIEWER">Reviewer</option>
            <option value="STUDENT">Student</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="GUEST">Guest</option>
          </select>
          <select
            value={inviteExpiry}
            onChange={(e) => setInviteExpiry(e.target.value)}
            className="rounded border px-2 py-1.5 text-sm"
          >
            <option value="1">Expires in 1 day</option>
            <option value="7">Expires in 7 days</option>
            <option value="30">Expires in 30 days</option>
            <option value="">Never expires</option>
          </select>
          <button
            type="submit"
            disabled={generating}
            className="rounded bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate link'}
          </button>
        </form>
      </section>
    </div>
  );
}
