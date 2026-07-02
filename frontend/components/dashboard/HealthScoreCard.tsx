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
  Stable: 'Steady performance with a few improvement areas.',
  'Needs Attention': 'Early warning signs require follow-up.',
  'At Risk': 'Urgent intervention needed to recover the project.',
};

const categoryBadge: Record<HealthScore['category'], string> = {
  Healthy: 'bg-emerald-100 text-emerald-800',
  Stable: 'bg-yellow-100 text-yellow-800',
  'Needs Attention': 'bg-orange-100 text-orange-800',
  'At Risk': 'bg-red-100 text-red-800',
};

const categoryBarColor: Record<HealthScore['category'], string> = {
  Healthy: '#10b981',
  Stable: '#f59e0b',
  'Needs Attention': '#f97316',
  'At Risk': '#ef4444',
};

export default function HealthScoreCard({ score }: { score?: HealthScore }) {
  if (!score) return (
    <div className="p-4 bg-white rounded shadow">Health data not available</div>
  );

  const badge = categoryBadge[score.category] ?? 'bg-slate-100 text-slate-800';
  const barColor = categoryBarColor[score.category] ?? '#94a3b8';

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-medium mb-2">Health Score</h4>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">{score.score}%</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{score.category}</span>
          </div>
          {score.trend && <div className="mt-2 text-sm text-gray-500">Trend: {score.trend}</div>}
        </div>
        <div className="h-20 w-20 rounded-full bg-slate-100 grid place-items-center text-xl font-semibold text-slate-900">{score.score}%</div>
      </div>

      {score.breakdown && (
        <div className="mt-5 space-y-3">
          <div className="text-sm font-semibold text-slate-700">Score breakdown</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-slate-100 bg-white p-3 text-sm">
              <div className="font-semibold">Milestone completion</div>
              <div className="text-slate-500">{score.breakdown.milestoneCompletion}%</div>
            </div>
            <div className="rounded border border-slate-100 bg-white p-3 text-sm">
              <div className="font-semibold">Deadline compliance</div>
              <div className="text-slate-500">{score.breakdown.deadlineCompliance}%</div>
            </div>
            <div className="rounded border border-slate-100 bg-white p-3 text-sm">
              <div className="font-semibold">Submission consistency</div>
              <div className="text-slate-500">{score.breakdown.submissionConsistency}%</div>
            </div>
            <div className="rounded border border-slate-100 bg-white p-3 text-sm">
              <div className="font-semibold">Supervisor engagement</div>
              <div className="text-slate-500">{score.breakdown.supervisorEngagement}%</div>
            </div>
            <div className="rounded border border-slate-100 bg-white p-3 text-sm sm:col-span-2">
              <div className="font-semibold">Project activity</div>
              <div className="text-slate-500">{score.breakdown.projectActivity}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-full bg-slate-200 h-3 overflow-hidden">
        <div style={{ width: `${score.score}%`, background: barColor, height: '100%' }} />
      </div>
      <p className="mt-3 text-sm text-slate-500">{categoryCopy[score.category]}</p>
    </div>
  );
}
