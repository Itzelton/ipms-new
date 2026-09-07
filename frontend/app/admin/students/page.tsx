"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../../services/api';

type User = { id: string; email: string; firstName?: string; lastName?: string; preferredName?: string; isActive?: boolean; studentProfile?: { advisorId?: string | null } | null };
type PendingInvite = { id: string; email: string; firstName?: string | null; lastName?: string | null; role: string; createdAt: string };
type Modal = { mode: 'create' | 'edit' | 'delete'; user?: User } | null;

function displayName(u: User | PendingInvite) {
  const pref = (u as User).preferredName;
  if (pref) return pref;
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [pending, setPending] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, pend] = await Promise.all([
        apiGet('/users/students'),
        apiGet('/users/pending-invites?role=STUDENT'),
      ]);
      setStudents(Array.isArray(data) ? data : []);
      setPending(Array.isArray(pend) ? pend : []);
    } catch { setStudents([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function openCreate() { setForm({ firstName: '', lastName: '', email: '', password: '' }); setModal({ mode: 'create' }); }
  function openEdit(u: User) { setForm({ firstName: u.firstName || '', lastName: u.lastName || '', email: u.email, password: '' }); setModal({ mode: 'edit', user: u }); }
  function openDelete(u: User) { setModal({ mode: 'delete', user: u }); }

  async function save() {
    setSaving(true);
    try {
      if (modal?.mode === 'create') {
        await apiPost('/users', { firstName: form.firstName, lastName: form.lastName, email: form.email, role: 'STUDENT' });
        setModal(null);
        showToast(`Invite sent to ${form.email}`);
        await load();
      } else if (modal?.mode === 'edit' && modal.user) {
        const body: any = { firstName: form.firstName, lastName: form.lastName, email: form.email };
        if (form.password) body.password = form.password;
        await apiPatch(`/users/${modal.user.id}`, body);
        setModal(null);
        showToast('Student updated.');
        await load();
      }
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
    setSaving(false);
  }

  async function deleteUser() {
    if (!modal?.user) return;
    setSaving(true);
    try {
      await apiDelete(`/users/${modal.user.id}`);
      showToast('Student removed.');
      setModal(null);
      await load();
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
    setSaving(false);
  }

  async function toggleActive(u: User) {
    try {
      await apiPatch(`/users/${u.id}`, { isActive: !u.isActive });
      await load();
      showToast(u.isActive ? 'Student deactivated.' : 'Student activated.');
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
  }

  async function resendInvite(invite: PendingInvite) {
    setResending(invite.id);
    try {
      await apiPost(`/users/pending-invites/${invite.id}/resend`, {});
      showToast(`Invite resent to ${invite.email}`);
      await load();
    } catch (e: any) { showToast(e?.message || 'Failed to resend.'); }
    setResending(null);
  }

  async function cancelInvite(invite: PendingInvite) {
    try {
      await apiDelete(`/users/pending-invites/${invite.id}`);
      showToast('Invite cancelled.');
      await load();
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
  }

  const filtered = students.filter(s =>
    displayName(s).toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">{toast}</div>}

      {/* Create / Edit modal */}
      {modal && modal.mode !== 'delete' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{modal.mode === 'create' ? 'Add Student' : 'Edit Student'}</h3>
            {modal.mode === 'create' && (
              <p className="text-xs text-slate-500 rounded-xl bg-sky-50 border border-sky-100 px-3 py-2">
                The student will receive an email with a link to set their own password.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block mb-1 text-xs font-semibold text-slate-500">First name</label><input value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} className="input w-full" /></div>
              <div><label className="block mb-1 text-xs font-semibold text-slate-500">Last name</label><input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} className="input w-full" /></div>
            </div>
            <div><label className="block mb-1 text-xs font-semibold text-slate-500">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input w-full" /></div>
            {modal.mode === 'edit' && (
              <div><label className="block mb-1 text-xs font-semibold text-slate-500">New password (leave blank to keep)</label><input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input w-full" /></div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={save} disabled={saving || !form.email}
                className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
                {saving ? 'Saving…' : modal.mode === 'create' ? 'Send Invite' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {modal?.mode === 'delete' && modal.user && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Remove Student?</h3>
            <p className="text-sm text-slate-500">This will permanently delete <strong>{displayName(modal.user)}</strong> and all their data.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={deleteUser} disabled={saving} className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="card-static p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">Admin</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Students</h2>
            <p className="mt-1 text-sm text-slate-500">Manage student accounts.</p>
          </div>
          <button onClick={openCreate} className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition flex-shrink-0">
            + Add student
          </button>
        </div>
      </header>

      {/* Pending invites */}
      {pending.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/60 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-amber-800">Pending Invites</span>
            <span className="ml-auto text-xs text-amber-600">{pending.length} awaiting</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {pending.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                    {displayName(inv).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{displayName(inv)}</p>
                    <p className="text-xs text-slate-400">{inv.email} · invited {timeAgo(inv.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resendInvite(inv)}
                    disabled={resending === inv.id}
                    className="rounded-full border border-sky-200 px-3 py-1 text-xs font-medium text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition disabled:opacity-50">
                    {resending === inv.id ? 'Sending…' : 'Resend Invite'}
                  </button>
                  <button
                    onClick={() => cancelInvite(inv)}
                    className="rounded-full border border-rose-100 px-3 py-1 text-xs font-medium text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition">
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Active students */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <svg className="h-4 w-4 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none flex-1" />
          <span className="text-xs text-slate-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">No students yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-sm font-bold text-white">
                    {displayName(s).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{displayName(s)}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.isActive === false && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Inactive</span>
                  )}
                  <button onClick={() => toggleActive(s)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-300 transition">
                    {s.isActive === false ? 'Activate' : 'Deactivate'}
                  </button>
                  <button onClick={() => openEdit(s)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-300 transition">Edit</button>
                  <button onClick={() => openDelete(s)} className="rounded-full border border-rose-100 px-3 py-1 text-xs font-medium text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
