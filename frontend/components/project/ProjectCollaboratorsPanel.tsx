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

export default function ProjectCollaboratorsPanel({ projectId }: { projectId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('REVIEWER');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await apiGet(`/projects/${projectId}/collaborators`);
      setCollaborators(Array.isArray(data) ? data : []);
    } catch {
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [projectId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    setError('');
    try {
      await apiPost(`/projects/${projectId}/collaborators`, { email: newEmail.trim(), role: newRole });
      setNewEmail('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'No account found with that email address.');
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
      // silently ignore
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return <div className="py-4 text-sm text-gray-500">Loading collaborators...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-700">
          {collaborators.length === 0 ? 'No collaborators yet' : `${collaborators.length} Collaborator${collaborators.length !== 1 ? 's' : ''}`}
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
      </div>

      <form onSubmit={handleAdd} className="space-y-3 rounded border border-dashed border-gray-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add collaborator</p>
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
        {error && <p className="text-xs text-red-600">{error}</p>}
        <p className="text-xs text-gray-400">
          Collaborators can view and edit this project. Enter the email address they registered with.
        </p>
      </form>
    </div>
  );
}
