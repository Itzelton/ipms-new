"use client";
import React from 'react';

const tabs = [
  { key: 'overview',      label: 'Overview' },
  { key: 'milestones',    label: 'Milestones' },
  { key: 'submissions',   label: 'Submissions' },
  { key: 'discussions',   label: 'Discussions' },
  { key: 'collaborators', label: 'Collaborators' },
];

export default function ProjectTabs({ activeTab, onChange }: { activeTab: string; onChange: (tab: string) => void }) {
  return (
    <div className="-mx-6 flex items-end gap-1 overflow-x-auto border-b border-slate-100 px-6 pb-0">
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={[
              'flex-shrink-0 px-3 pb-2.5 pt-1 text-[13px] font-medium transition-colors',
              active
                ? 'border-b-2 border-sky-500 text-sky-600'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
