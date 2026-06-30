"use client";
import React from 'react';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'submissions', label: 'Submissions' },
  { key: 'discussions', label: 'Discussions' },
];

export default function ProjectTabs({ activeTab, onChange }: { activeTab: string; onChange: (tab: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 px-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-600 hover:text-slate-900'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
