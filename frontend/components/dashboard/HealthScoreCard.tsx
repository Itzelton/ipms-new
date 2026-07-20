"use client";
import React from 'react';

export type HealthScore = {
  score: number;
  category: 'Healthy' | 'Stable' | 'Needs Attention' | 'At Risk';
  color?: string;
  trend?: string;
  breakdown?: {
    milestoneCompletion: number;
    deadlineCompliance: number;
    submissionConsistency: number;
    supervisorEngagement: number;
    projectActivity: number;
  };
};

const categoryCopy: Record<HealthScore['category'], string> = {
  Healthy: 'Strong project momentum and stable delivery.',
  Stable: 'Steady performance with minor improvement areas.',
  'Needs Attention': 'Early warning signs — follow up soon.',
  'At Risk': 'Urgent: intervention needed to recover.',
};

const categoryStyle: Record<HealthScore['category'], { badge: string; bar: string; ring: string }> = {
  Healthy:           { badge: 'bg-emerald-100 text-emerald-700', bar: 'from-emerald-400 to-emerald-500', ring: '#10b981' },
  Stable:            { badge: 'bg-amber-100 text-amber-700',     bar: 'from-amber-400 to-amber-500',     ring: '#f59e0b' },
  'Needs Attention': { badge: 'bg-orange-100 text-orange-700',   bar: 'from-orange-400 to-orange-500',   ring: '#f97316' },
  'At Risk':         { badge: 'bg-rose-100 text-rose-700',       bar: 'from-rose-400 to-rose-500',       ring: '#ef4444' },
};

const breakdownItems = [
  { key: 'milestoneCompletion',    label: 'Milestones' },
  { key: 'deadlineCompliance',     label: 'Deadlines' },
  { key: 'submissionConsistency',  label: 'Submissions' },
  { key: 'supervisorEngagement',   label: 'Engagement' },
  { key: 'projectActivity',        label: 'Activity' },
] as const;

export default function HealthScoreCard({ score }: { score?: HealthScore }) {
  if (!score) return (
    <div className="card p-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">Health data unavailable</p>
      </div>
    </div>
  );

  const style = categoryStyle[score.category] ?? categoryStyle.Stable;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 shadow-sm">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Health Score</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.badge}`}>
          {score.category}
        </span>
      </div>

      <div className="mt-5 flex items-end gap-4">
        <span className="text-5xl font-bold tracking-tight text-slate-900">{score.score}</span>
        <div className="pb-1">
          <span className="text-2xl font-light text-slate-300">/</span>
          <span className="ml-1 text-lg text-slate-400 font-medium">100</span>
          {score.trend && (
            <p className="mt-0.5 text-[12px] text-slate-400">Trend: {score.trend}</p>
          )}
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-700`}
          style={{ width: `${score.score}%` }}
        />
      </div>
      <p className="mt-2.5 text-[12px] text-slate-500">{categoryCopy[score.category]}</p>

      {score.breakdown && (
        <div className="mt-5 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Breakdown</p>
          {breakdownItems.map(({ key, label }) => {
            const val = score.breakdown![key];
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold tabular-nums text-slate-700">{val}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
