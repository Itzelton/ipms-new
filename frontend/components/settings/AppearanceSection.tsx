"use client";
import React from 'react';
import { useSettings, Theme } from '../../contexts/SettingsContext';

// ── Mini theme previews ────────────────────────────────────────────────────

function LightPreview() {
  return (
    <div className="h-[72px] overflow-hidden rounded-xl" style={{ background: '#e8f1ff' }}>
      <div className="h-5" style={{ background: 'rgba(255,255,255,0.88)' }} />
      <div className="flex gap-1.5 p-2">
        <div className="w-7 rounded-md" style={{ background: 'rgba(255,255,255,0.92)', height: 36 }} />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.92)' }} />
          <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.92)' }} />
          <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.92)' }} />
        </div>
      </div>
    </div>
  );
}

function DarkPreview() {
  return (
    <div className="h-[72px] overflow-hidden rounded-xl" style={{ background: '#0b1627' }}>
      <div className="h-5" style={{ background: 'rgba(15,23,42,0.92)' }} />
      <div className="flex gap-1.5 p-2">
        <div className="w-7 rounded-md" style={{ background: 'rgba(30,41,59,0.88)', height: 36 }} />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-full rounded" style={{ background: 'rgba(30,41,59,0.88)' }} />
          <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(30,41,59,0.88)' }} />
          <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(30,41,59,0.88)' }} />
        </div>
      </div>
    </div>
  );
}

function SystemPreview() {
  return (
    <div className="h-[72px] overflow-hidden rounded-xl flex">
      <div className="flex w-1/2 flex-col" style={{ background: '#e8f1ff' }}>
        <div className="h-5" style={{ background: 'rgba(255,255,255,0.88)' }} />
        <div className="flex-1 p-1.5 space-y-1">
          <div className="h-2.5 w-full rounded" style={{ background: 'rgba(255,255,255,0.92)' }} />
          <div className="h-2.5 w-2/3 rounded" style={{ background: 'rgba(255,255,255,0.92)' }} />
        </div>
      </div>
      <div className="flex w-1/2 flex-col" style={{ background: '#0b1627' }}>
        <div className="h-5" style={{ background: 'rgba(15,23,42,0.92)' }} />
        <div className="flex-1 p-1.5 space-y-1">
          <div className="h-2.5 w-full rounded" style={{ background: 'rgba(30,41,59,0.88)' }} />
          <div className="h-2.5 w-2/3 rounded" style={{ background: 'rgba(30,41,59,0.88)' }} />
        </div>
      </div>
    </div>
  );
}

const THEME_OPTIONS: { id: Theme; label: string; description: string; preview: React.ReactNode }[] = [
  { id: 'light',  label: 'Light',  description: 'Clean white interface',        preview: <LightPreview /> },
  { id: 'dark',   label: 'Dark',   description: 'Easy on the eyes at night',   preview: <DarkPreview /> },
  { id: 'system', label: 'System', description: 'Follows your OS preference',  preview: <SystemPreview /> },
];

// ── Toggle switch ──────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-800">{label}</p>
        {description && <p className="mt-0.5 text-[12px] text-slate-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={[
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
          checked ? 'bg-sky-500' : 'bg-slate-200',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md',
            'ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────

export default function AppearanceSection() {
  const { theme, setTheme, persistentSidebar, setPersistentSidebar, compact, setCompact } = useSettings();

  return (
    <div className="space-y-4">
      {/* Theme picker */}
      <div className="card p-6">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={[
                  'relative rounded-2xl p-0.5 transition-all',
                  active
                    ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-white/80'
                    : 'ring-1 ring-slate-200 hover:ring-slate-300',
                ].join(' ')}
              >
                <div className="overflow-hidden rounded-xl">{opt.preview}</div>
                <div className="px-1 pb-2 pt-2 text-left">
                  <div className="flex items-center justify-between">
                    <p className={`text-[12px] font-semibold ${active ? 'text-sky-600' : 'text-slate-700'}`}>
                      {opt.label}
                    </p>
                    {active && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500">
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout options */}
      <div className="card p-6 space-y-5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Layout</p>
        <Toggle
          checked={persistentSidebar}
          onChange={setPersistentSidebar}
          label="Persistent sidebar"
          description="Keep the sidebar pinned on desktop screens"
        />
        <div className="border-t border-slate-100" />
        <Toggle
          checked={compact}
          onChange={setCompact}
          label="Compact mode"
          description="Reduce padding for a denser layout"
        />
      </div>
    </div>
  );
}
