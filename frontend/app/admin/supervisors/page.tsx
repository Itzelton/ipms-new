"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../../services/api';

type User = { id: string; email: string; firstName?: string; lastName?: string; preferredName?: string; isActive?: boolean };
type Modal = { mode: 'create' | 'edit' | 'delete'; user?: User } | null;

function displayName(u: User) {
  return u.preferredName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

export default function AdminSupervisorsPage() {
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sv, st] = await Promise.all([apiGet('/users/supervisors'), apiGet('/users/students')]);
      setSupervisors(Array.isArray(sv) ? sv : []);
      setStudents(Array.isArray(st) ? st : []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  async function save() {
    setSaving(true);
    try {
      if (modal?.mode === 'create') {
        await apiPost('/users', { ...form, role: 'SUPERVISOR' });
        setModal(null);
        showToast(`Invite sent to ${form.email}`);
        await load();
      } else if (modal?.mode === 'edit' && modal.user) {
        const body: any = { firstName: form.firstName, lastName: form.lastName, email: form.email };
        if (form.password) body.password = form.password;
        await apiPatch(`/users/${modal.user.id}`, body);
        setModal(null);
        showToast('Supervisor updated.');
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
      showToast('Supervisor removed.');
      setModal(null);
      await load();
    } catch (e: any) { showToast(e?.message || 'Failed.'); }
    setSaving(false);
  }

  const filtered = supervisors.filter(s =>
    displayName(s).toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  function assignedCount(svId: string) {
    return students.filter((s: any) => s.studentProfile?.advisorId === svId).length;
  }

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">{toast}</div>}

      {modal && modal.mode !== 'delete' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{modal.mode === 'create' ? 'Add Supervisor' : 'Edit Supervisor'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block mb-1 text-xs font-semibold text-slate-500">First name</label><input value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} className="input w-full" /></div>
              <div><label className="block mb-1 text-xs font-semibold text-slate-500">Last name</label><input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} className="input w-full" /></div>
            </div>
            <div><label className="block mb-1 text-xs font-semibold text-slate-500">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input w-full" /></div>
            <div><label className="block mb-1 text-xs font-semibold text-slate-500">{modal.mode === 'create' ? 'Password' : 'New password (leave blank to keep)'}</label><input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input w-full" /></div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={save} disabled={saving || !form.email || (modal.mode === 'create' && !form.password)}
                className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
                {saving ? 'Saving…' : modal.mode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.mode === 'delete' && modal.user && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Remove Supervisor?</h3>
            <p className="text-sm text-slate-500">This will permanently delete <strong>{displayName(modal.user)}</strong>.</p>
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
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Supervisors</h2>
            <p className="mt-1 text-sm text-slate-500">Manage supervisor accounts.</p>
          </div>
          <button onClick={() => { setForm({ firstName: '', lastName: '', email: '', password: '' }); setModal({ mode: 'create' }); }}
            className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition flex-shrink-0">
            + Add supervisor
          </button>
        </div>
      </header>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <svg className="h-4 w-4 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supervisors…" className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none flex-1" />
          <span className="text-xs text-slate-400">{filtered.length}</span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">No supervisors found.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((sv) => {
              const count = assignedCount(sv.id);
              return (
                <li key={sv.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-sm font-bold text-white">
                      {displayName(sv).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{displayName(sv)}</p>
                      <p className="text-xs text-slate-400">{sv.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {count} student{count !== 1 ? 's' : ''}
                    </span>
                    <button onClick={() => { setForm({ firstName: sv.firstName || '', lastName: sv.lastName || '', email: sv.email, password: '' }); setModal({ mode: 'edit', user: sv }); }}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-300 transition">Edit</button>
                    <button onClick={() => setModal({ mode: 'delete', user: sv })}
                      className="rounded-full border border-rose-100 px-3 py-1 text-xs font-medium text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition">Remove</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
