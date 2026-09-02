"use client";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../../services/api';

// ── Types ────────────────────────────────────────────────────────────────────

type RoleName = 'STUDENT' | 'SUPERVISOR' | 'ADMIN';

type StudentProfile = {
  enrollmentId?: string;
  level?: string | null;
  advisorId?: string | null;
};

type SupervisorProfile = {
  office?: string | null;
};

type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  preferredName?: string | null;
  isActive?: boolean;
  createdAt?: string;
  roles: { role: { name: RoleName } }[];
  studentProfile?: StudentProfile | null;
  supervisorProfile?: SupervisorProfile | null;
};

type TabFilter = 'ALL' | 'STUDENT' | 'SUPERVISOR';

// ── Helpers ──────────────────────────────────────────────────────────────────

function displayName(u: User) {
  return u.preferredName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

function getRole(u: User): RoleName {
  return (u.roles?.[0]?.role?.name ?? 'STUDENT') as RoleName;
}

function roleBadge(role: RoleName) {
  const map: Record<RoleName, { label: string; className: string }> = {
    STUDENT: { label: 'Student', className: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' },
    SUPERVISOR: { label: 'Supervisor', className: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
    ADMIN: { label: 'Admin', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  };
  const { label, className } = map[role] ?? map.STUDENT;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

// ── Modal shell ──────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-lg mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// ── Field component ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
}

// ── Input styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none transition';

const selectCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-400 focus:bg-white focus:outline-none transition';

// ── Create User Modal ────────────────────────────────────────────────────────

type CreateForm = {
  email: string;
  role: RoleName;
  firstName: string;
  lastName: string;
  indexNumber: string;
  level: string;
  course: string;
  department: string;
  studentReferenceNumber: string;
  referenceNumber: string;
};

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateForm>({
    email: '', role: 'STUDENT', firstName: '', lastName: '',
    indexNumber: '', level: '', course: '', department: '', studentReferenceNumber: '', referenceNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof CreateForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, any> = {
        email: form.email,
        role: form.role,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
      };
      if (form.role === 'STUDENT') {
        if (form.indexNumber) body.indexNumber = form.indexNumber;
        if (form.level) body.level = form.level;
        if (form.course) body.course = form.course;
        if (form.department) body.department = form.department;
        if (form.studentReferenceNumber) body.studentReferenceNumber = form.studentReferenceNumber;
      }
      if (form.role === 'SUPERVISOR') {
        if (form.referenceNumber) body.referenceNumber = form.referenceNumber;
      }
      await apiPost('/users', body);
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Create User</h3>
        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>
      <p className="text-sm text-slate-500">An invitation email will be sent to the user to set their password.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Role">
          <select value={form.role} onChange={(e) => set('role', e.target.value as RoleName)} className={selectCls}>
            <option value="STUDENT">Student</option>
            <option value="SUPERVISOR">Supervisor / Lecturer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>

        <Field label="Email address *">
          <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="user@example.com" className={inputCls} />
        </Field>

        {/* Supervisor: name + email + staff ID */}
        {form.role === 'SUPERVISOR' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name *">
                <input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="e.g. Kofi" className={inputCls} />
              </Field>
              <Field label="Last name *">
                <input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="e.g. Boateng" className={inputCls} />
              </Field>
            </div>
            <Field label="Staff ID / Reference number *">
              <input
                required
                value={form.referenceNumber}
                onChange={(e) => set('referenceNumber', e.target.value)}
                placeholder="e.g. LEC-0042"
                className={inputCls}
              />
            </Field>
          </>
        )}

        {/* Student: full details required */}
        {form.role === 'STUDENT' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name *">
                <input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="e.g. Kwame" className={inputCls} />
              </Field>
              <Field label="Last name *">
                <input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="e.g. Mensah" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Course *">
                <input required value={form.course} onChange={(e) => set('course', e.target.value)} placeholder="e.g. BSc Computer Science" className={inputCls} />
              </Field>
              <Field label="Department *">
                <input required value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Computer Science" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Index number (8 digits) *">
                <input
                  required
                  value={form.indexNumber}
                  onChange={(e) => set('indexNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678"
                  maxLength={8}
                  minLength={8}
                  className={inputCls}
                />
              </Field>
              <Field label="Reference number *">
                <input
                  required
                  value={form.studentReferenceNumber}
                  onChange={(e) => set('studentReferenceNumber', e.target.value)}
                  placeholder="e.g. REF-2024-001"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Level *">
              <select required value={form.level} onChange={(e) => set('level', e.target.value)} className={selectCls}>
                <option value="">— Select level —</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
              </select>
            </Field>
          </>
        )}

        {/* Admin: just email, they set their name themselves */}
        {form.role === 'ADMIN' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="e.g. Kwame" className={inputCls} />
            </Field>
            <Field label="Last name">
              <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="e.g. Mensah" className={inputCls} />
            </Field>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 transition"
          >
            {saving ? 'Creating…' : 'Create & Send Invite'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit User Modal ──────────────────────────────────────────────────────────

function EditUserModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const role = getRole(user);
  const sp = (user as any).studentProfile;
  const svp = (user as any).supervisorProfile;
  const [form, setForm] = useState({
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    level: sp?.level ?? '',
    course: sp?.course ?? '',
    department: sp?.department ?? '',
    studentReferenceNumber: sp?.referenceNumber ?? '',
    referenceNumber: svp?.office ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, any> = {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
      };
      if (role === 'STUDENT') {
        if (form.level) body.level = form.level;
        if (form.course) body.course = form.course;
        if (form.department) body.department = form.department;
        if (form.studentReferenceNumber) body.studentReferenceNumber = form.studentReferenceNumber;
      }
      if (role === 'SUPERVISOR' && form.referenceNumber) body.referenceNumber = form.referenceNumber;
      await apiPatch(`/users/${user.id}`, body);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Edit User</h3>
        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {roleBadge(role)}
        <span className="text-sm text-slate-500">{user.email}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First name" className={inputCls} />
          </Field>
          <Field label="Last name">
            <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" className={inputCls} />
          </Field>
        </div>

        {role === 'STUDENT' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Course">
                <input value={form.course} onChange={(e) => set('course', e.target.value)} placeholder="e.g. BSc Computer Science" className={inputCls} />
              </Field>
              <Field label="Department">
                <input value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Computer Science" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Reference number">
                <input value={form.studentReferenceNumber} onChange={(e) => set('studentReferenceNumber', e.target.value)} placeholder="e.g. REF-2024-001" className={inputCls} />
              </Field>
              <Field label="Level">
                <select value={form.level} onChange={(e) => set('level', e.target.value)} className={selectCls}>
                  <option value="">— Select level —</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                </select>
              </Field>
            </div>
          </>
        )}

        {role === 'SUPERVISOR' && (
          <Field label="Staff ID / Reference number">
            <input value={form.referenceNumber} onChange={(e) => set('referenceNumber', e.target.value)} placeholder="e.g. LEC-0042" className={inputCls} />
          </Field>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 transition"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Assign Supervisor Modal ──────────────────────────────────────────────────

function AssignSupervisorModal({
  student, supervisors, onClose, onSaved,
}: {
  student: User;
  supervisors: User[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState(student.studentProfile?.advisorId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await apiPatch(`/users/${student.id}/assign-supervisor`, { supervisorId: selected || null });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign supervisor.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Assign Supervisor</h3>
        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>
      <p className="text-sm text-slate-500">
        Assigning a supervisor for <strong className="text-slate-700">{displayName(student)}</strong>.
      </p>

      <Field label="Supervisor">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className={selectCls}>
          <option value="">— Unassigned —</option>
          {supervisors.map((sv) => (
            <option key={sv.id} value={sv.id}>{displayName(sv)} ({sv.email})</option>
          ))}
        </select>
      </Field>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 transition"
        >
          {saving ? 'Saving…' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({ user, onClose, onDeleted }: { user: User; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await apiDelete(`/users/${user.id}`);
      onDeleted();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user.');
      setDeleting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
          <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Delete user?</h3>
          <p className="mt-1 text-sm text-slate-500">
            This will deactivate <strong className="text-slate-700">{displayName(user)}</strong> ({user.email}). This action cannot be undone.
          </p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
        >
          {deleting ? 'Deleting…' : 'Delete User'}
        </button>
      </div>
    </Modal>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">
      <svg className="h-4 w-4 text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; user: User }
  | { type: 'delete'; user: User }
  | { type: 'assign'; user: User };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('ALL');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [toast, setToast] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, svs] = await Promise.all([
        apiGet('/users?limit=200'),
        apiGet('/users/supervisors'),
      ]);
      setUsers(Array.isArray(all) ? all : []);
      setSupervisors(Array.isArray(svs) ? svs : []);
    } catch {
      // leave empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtered + searched users for the table
  const displayed = useMemo(() => {
    let list = users;
    if (tab !== 'ALL') {
      list = list.filter((u) => getRole(u) === tab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        displayName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.studentProfile?.enrollmentId?.toLowerCase().includes(q) ||
        u.supervisorProfile?.office?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, tab, search]);

  // Stats
  const students = useMemo(() => users.filter((u) => getRole(u) === 'STUDENT'), [users]);
  const supsList = useMemo(() => users.filter((u) => getRole(u) === 'SUPERVISOR'), [users]);
  const inactive = useMemo(() => users.filter((u) => u.isActive === false), [users]);

  async function handleToggleActive(u: User) {
    setToggling(u.id);
    try {
      const endpoint = u.isActive ? 'deactivate' : 'activate';
      await apiPatch(`/users/${u.id}/${endpoint}`, {});
      showToast(`User ${u.isActive ? 'deactivated' : 'activated'} successfully.`);
      await load();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status.');
    } finally {
      setToggling(null);
    }
  }

  const supervisorMap = useMemo(
    () => Object.fromEntries(supervisors.map((s) => [s.id, s])),
    [supervisors],
  );

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'STUDENT', label: 'Students' },
    { key: 'SUPERVISOR', label: 'Supervisors' },
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Modals */}
      {modal.type === 'create' && (
        <CreateUserModal
          onClose={() => setModal({ type: 'none' })}
          onCreated={() => { load(); showToast('User created. Invite email sent.'); }}
        />
      )}
      {modal.type === 'edit' && (
        <EditUserModal
          user={modal.user}
          onClose={() => setModal({ type: 'none' })}
          onSaved={() => { load(); showToast('User updated successfully.'); }}
        />
      )}
      {modal.type === 'delete' && (
        <DeleteConfirmModal
          user={modal.user}
          onClose={() => setModal({ type: 'none' })}
          onDeleted={() => { load(); showToast('User removed.'); }}
        />
      )}
      {modal.type === 'assign' && (
        <AssignSupervisorModal
          student={modal.user}
          supervisors={supervisors}
          onClose={() => setModal({ type: 'none' })}
          onSaved={() => { load(); showToast('Supervisor assigned.'); }}
        />
      )}

      {/* Header */}
      <div className="card-static flex items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h2>
          <p className="mt-1 text-sm text-slate-500">Create, manage and assign roles to all system users.</p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-slate-900' },
          { label: 'Students', value: students.length, color: 'text-sky-700' },
          { label: 'Supervisors', value: supsList.length, color: 'text-violet-700' },
          { label: 'Inactive', value: inactive.length, color: inactive.length > 0 ? 'text-amber-600' : 'text-slate-900' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, index…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-400 focus:outline-none transition sm:w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">Loading users…</div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="mb-3 h-10 w-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">No users found</p>
            <p className="mt-1 text-xs text-slate-400">{search ? 'Try a different search term.' : 'Create a user to get started.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Role</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Index / Ref</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Level</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map((u) => {
                  const role = getRole(u);
                  const isActive = u.isActive !== false;
                  const isTogglingThis = toggling === u.id;
                  const advisorId = u.studentProfile?.advisorId;
                  const advisor = advisorId ? supervisorMap[advisorId] : null;

                  return (
                    <tr key={u.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">{displayName(u)}</p>
                          {role === 'STUDENT' && advisor && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              Supervisor: {displayName(advisor)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">{roleBadge(role)}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {role === 'STUDENT'
                          ? (u.studentProfile?.enrollmentId || '—')
                          : role === 'SUPERVISOR'
                          ? (u.supervisorProfile?.office || '—')
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {role === 'STUDENT' ? (u.studentProfile?.level || '—') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => setModal({ type: 'edit', user: u })}
                            title="Edit user"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isTogglingThis}
                            title={isActive ? 'Deactivate' : 'Activate'}
                            className={`rounded-lg p-1.5 transition ${
                              isActive
                                ? 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                                : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                            } disabled:opacity-40`}
                          >
                            {isActive ? (
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          {/* Assign Supervisor (students only) */}
                          {role === 'STUDENT' && (
                            <button
                              onClick={() => setModal({ type: 'assign', user: u })}
                              title="Assign supervisor"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.660.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setModal({ type: 'delete', user: u })}
                            title="Delete user"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
