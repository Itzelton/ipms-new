"use client";
import React, { useState } from 'react';
import ProfileSection      from './ProfileSection';
import AppearanceSection   from './AppearanceSection';
import NotificationsSection from './NotificationsSection';
import SecuritySection     from './SecuritySection';
import AccountSection      from './AccountSection';

type SectionId = 'profile' | 'appearance' | 'notifications' | 'security' | 'account';

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Account',
    icon: (
      <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const SECTION_CONTENT: Record<SectionId, React.ReactNode> = {
  profile:       <ProfileSection />,
  appearance:    <AppearanceSection />,
  notifications: <NotificationsSection />,
  security:      <SecuritySection />,
  account:       <AccountSection />,
};

export default function SettingsLayout() {
  const [active, setActive] = useState<SectionId>('profile');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="card-static p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 shadow-md">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500">Manage your account, appearance, and preferences</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Section nav — desktop sidebar / mobile scroll strip */}
        <nav className="flex gap-1 overflow-x-auto pb-1 lg:w-[200px] lg:flex-shrink-0 lg:flex-col lg:pb-0">
          <div className="card p-2 flex gap-1 lg:flex-col">
            {SECTIONS.map((s) => {
              const active_ = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={[
                    'flex min-w-max items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium',
                    'transition-all duration-150 text-left whitespace-nowrap lg:w-full',
                    active_
                      ? 'text-sky-700'
                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-900',
                  ].join(' ')}
                  style={active_ ? {
                    background: 'rgba(255,255,255,0.85)',
                    boxShadow: '0 2px 10px rgba(14,165,233,0.10), 0 0 0 1px rgba(14,165,233,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
                  } : undefined}
                >
                  <span className={active_ ? 'text-sky-500' : 'text-slate-400'}>
                    {s.icon}
                  </span>
                  <span>{s.label}</span>
                  {active_ && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)] lg:block" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Section content */}
        <div className="min-w-0 flex-1">
          {SECTION_CONTENT[active]}
        </div>
      </div>
    </div>
  );
}
