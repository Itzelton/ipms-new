"use client";
import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/api';
import { useAuth } from '../auth/auth-context';

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
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorLimit, setCollaboratorLimit] = useState(1);
  const [savingLimit, setSavingLimit] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [projectStudentId, setProjectStudentId] = useState<string | null>(null);
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
    const [collab, inv, project] = await Promise.allSettled([
      apiGet(`/projects/${projectId}/collaborators`),
      apiGet(`/projects/${projectId}/invites`),
      apiGet(`/projects/${projectId}`),
    ]);
    setCollaborators(collab.status === 'fulfilled' && Array.isArray(collab.value) ? collab.value : []);
    setInvites(inv.status === 'fulfilled' && Array.isArray(inv.value) ? inv.value : []);
    if (project.status === 'fulfilled') {
      if (typeof project.value?.collaboratorLimit === 'number') {
        setCollaboratorLimit(project.value.collaboratorLimit);
      }
      if (project.value?.studentId) setProjectStudentId(project.value.studentId);
    }
    setLoading(false);
  }

  async function saveLimit() {
    setSavingLimit(true);
    setAddError('');
    try {
      await apiPatch(`/projects/${projectId}/collaborator-limit`, { collaboratorLimit });
      await load();
    } catch (err: any) {
      setAddError(err?.message || 'Unable to update the collaborator limit.');
    } finally {
      setSavingLimit(false);
    }
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
    return <div className="py-6 text-sm text-slate-400 text-center">Loading collaborators…</div>;
  }

  const isSupervisor = user?.role === 'SUPERVISOR';
  const isProjectStudent = user?.id === projectStudentId;
  const canManageCollaborators = isSupervisor || isProjectStudent;

  return (
    <div className="space-y-6">

      {/* Team limit (supervisor only) */}
      {isSupervisor && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <label className="text-[12px] font-medium text-slate-600 shrink-0" htmlFor="collaborator-limit">
            Team-member limit
          </label>
          <input
            id="collaborator-limit"
            type="number" min="0" max="50"
            value={collaboratorLimit}
            onChange={(e) => setCollaboratorLimit(Math.max(0, Number(e.target.value)))}
            className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button" onClick={saveLimit} disabled={savingLimit}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition"
          >
            {savingLimit ? 'Saving…' : 'Save'}
          </button>
          {addError && <p className="text-[12px] text-rose-600">{addError}</p>}
        </div>
      )}

      {/* Collaborators list */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {collaborators.length === 0
            ? `No collaborators yet · limit ${collaboratorLimit}`
            : `${collaborators.length} of ${collaboratorLimit} collaborator${collaboratorLimit !== 1 ? 's' : ''}`}
        </p>
        {collaborators.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm text-slate-400">No collaborators have been added yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
            {collaborators.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-[11px] font-bold text-white">
                    {displayName(c).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-slate-800">{displayName(c)}</p>
                    <p className="truncate text-[11px] text-slate-400">{c.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {ROLE_LABELS[c.role] ?? c.role}
                  </span>
                  {isSupervisor && (
                    <button
                      onClick={() => handleRemove(c.user?.id)}
                      disabled={removingId === c.user?.id}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50 transition"
                      title="Remove collaborator"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add by email (supervisor or project student) */}
      {canManageCollaborators && (
        <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-dashed border-slate-200 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Add collaborator by email</p>
          <p className="text-[11px] text-slate-400">
            {isSupervisor ? 'Only students supervised by you can be added.' : 'Invite a teammate by their registered email address.'}
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="student@example.com"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="submit"
              disabled={adding || !newEmail.trim()}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </div>
          {addError && <p className="text-[12px] text-rose-600">{addError}</p>}
        </form>
      )}

      {/* Invite links (supervisor only) */}
      {isSupervisor && (
        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Invite links</p>

          {invites.length > 0 && (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
              {invites.map((inv) => {
                const link = `${ORIGIN}/invite/${inv.token}`;
                const expired = inv.expiresAt && new Date(inv.expiresAt) < new Date();
                return (
                  <li key={inv.id} className="flex items-start justify-between gap-4 bg-white px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {ROLE_LABELS[inv.role] ?? inv.role}
                        </span>
                        {expired && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Expired</span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          Used {inv.usedCount}×
                          {inv.expiresAt && !expired && ` · expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono text-[11px] text-slate-400">{link}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleCopy(inv.token)}
                        className="rounded-lg px-2 py-1 text-[11px] font-medium text-sky-600 hover:bg-sky-50 transition"
                      >
                        {copiedToken === inv.token ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleRevokeInvite(inv.token)}
                        className="rounded-lg px-2 py-1 text-[11px] font-medium text-rose-500 hover:bg-rose-50 transition"
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              <option value="REVIEWER">Reviewer</option>
              <option value="STUDENT">Student</option>
              <option value="GUEST">Guest</option>
            </select>
            <select
              value={inviteExpiry}
              onChange={(e) => setInviteExpiry(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              <option value="1">Expires in 1 day</option>
              <option value="7">Expires in 7 days</option>
              <option value="30">Expires in 30 days</option>
              <option value="">Never expires</option>
            </select>
            <button
              type="submit"
              disabled={generating}
              className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {generating ? 'Generating…' : 'Generate invite link'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
