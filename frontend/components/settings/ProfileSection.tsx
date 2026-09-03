"use client";
import React, { useState } from 'react';
import { useAuth } from '../auth/auth-context';
import AvatarSelector, { AVATARS } from './AvatarSelector';
import { apiPatch } from '../../services/api';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  SUPERVISOR: 'Supervisor',
  STUDENT: 'Student',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN:      'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  SUPERVISOR: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  STUDENT:    'bg-sky-500/15 text-sky-600 dark:text-sky-400',
};

export default function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const nameStr = user?.name || user?.email || '';
  const initials = nameStr.slice(0, 2).toUpperCase();

  const [avatarId, setAvatarId] = useState('av-1');
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const currentAvatar = AVATARS.find((a) => a.id === avatarId);
  const avatarGradient = currentAvatar?.gradient ?? 'from-sky-400 to-blue-600';

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await apiPatch('/users/me', { name, bio, avatarId: customUrl ? 'custom' : avatarId });
      await refreshUser();
      setSaved(true);
      setShowPicker(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="card p-6">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Avatar</p>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {customUrl ? (
              <img
                src={customUrl}
                alt="Avatar"
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white shadow-lg"
              />
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarGradient} ring-2 ring-white shadow-lg`}
              >
                <span className="text-2xl font-black text-white">{initials}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-900">{user?.name || 'Your Name'}</p>
            <p className="mt-0.5 text-[12px] text-slate-500">{user?.email}</p>
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              {showPicker ? 'Hide picker' : 'Change avatar'}
            </button>
          </div>
        </div>

        {showPicker && (
          <AvatarSelector
            currentAvatar={avatarId}
            customUrl={customUrl}
            initials={initials}
            onSelect={(id) => { setAvatarId(id); setCustomUrl(null); }}
            onUpload={(url) => setCustomUrl(url || null)}
          />
        )}
      </div>

      {/* Info */}
      <div className="card p-6 space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Personal Information</p>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Display Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Bio</label>
          <textarea
            className="input resize-none"
            rows={3}
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio about yourself…"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{bio.length}/160</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Email</label>
            <div className="input cursor-not-allowed select-none bg-slate-50/80 text-slate-500">
              {user?.email}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Role</label>
            <div className="flex items-center gap-2 py-2.5">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_COLORS[user?.role ?? 'STUDENT']}`}
              >
                {ROLE_LABELS[user?.role ?? 'STUDENT']}
              </span>
              <span className="text-[11px] text-slate-400">read-only</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-[12px] font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-2 px-5 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
