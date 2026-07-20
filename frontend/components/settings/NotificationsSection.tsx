"use client";
import React, { useState } from 'react';

type NotifItem = { id: string; label: string; description?: string };

const EMAIL_ITEMS: NotifItem[] = [
  { id: 'email_milestones', label: 'Milestone reminders',  description: '48 hours before a deadline' },
  { id: 'email_feedback',   label: 'Submission feedback',  description: 'When a supervisor reviews your work' },
  { id: 'email_discussions',label: 'Discussion replies',   description: 'When someone replies in a thread' },
  { id: 'email_messages',   label: 'Supervisor messages',  description: 'Direct messages from your supervisor' },
  { id: 'email_digest',     label: 'Weekly digest',        description: 'A summary of your project activity' },
];

const APP_ITEMS: NotifItem[] = [
  { id: 'app_milestones',  label: 'Milestone reminders' },
  { id: 'app_feedback',    label: 'Submission feedback' },
  { id: 'app_discussions', label: 'Discussion replies' },
  { id: 'app_messages',    label: 'Messages' },
  { id: 'app_alerts',      label: 'Risk alerts & health warnings' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={[
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        checked ? 'bg-sky-500' : 'bg-slate-200',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out',
          checked ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

function NotifGroup({
  title,
  subtitle,
  items,
  master,
  onMaster,
  prefs,
  onPref,
}: {
  title: string;
  subtitle: string;
  items: NotifItem[];
  master: boolean;
  onMaster: (v: boolean) => void;
  prefs: Record<string, boolean>;
  onPref: (id: string, v: boolean) => void;
}) {
  return (
    <div className="card p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{title}</p>
          <p className="mt-1 text-[12px] text-slate-500">{subtitle}</p>
        </div>
        <Toggle checked={master} onChange={onMaster} />
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li
            key={item.id}
            className={[
              'flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 transition-opacity',
              !master ? 'pointer-events-none opacity-40' : '',
            ].join(' ')}
          >
            <div>
              <p className="text-[13px] font-medium text-slate-800">{item.label}</p>
              {item.description && (
                <p className="mt-0.5 text-[11px] text-slate-400">{item.description}</p>
              )}
            </div>
            <Toggle checked={!!prefs[item.id]} onChange={(v) => onPref(item.id, v)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NotificationsSection() {
  const [emailMaster, setEmailMaster] = useState(true);
  const [appMaster, setAppMaster] = useState(true);
  const [saved, setSaved] = useState(false);

  const allItems = [...EMAIL_ITEMS, ...APP_ITEMS];
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    () => Object.fromEntries(allItems.map((i) => [i.id, true]))
  );

  function setPref(id: string, v: boolean) {
    setPrefs((p) => ({ ...p, [id]: v }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      <NotifGroup
        title="Email Notifications"
        subtitle="Sent to your registered email address"
        items={EMAIL_ITEMS}
        master={emailMaster}
        onMaster={setEmailMaster}
        prefs={prefs}
        onPref={setPref}
      />
      <NotifGroup
        title="In-App Notifications"
        subtitle="Shown in the notification bell"
        items={APP_ITEMS}
        master={appMaster}
        onMaster={setAppMaster}
        prefs={prefs}
        onPref={setPref}
      />
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Preferences saved
          </span>
        )}
        <button onClick={handleSave} className="btn-primary py-2 px-5">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
