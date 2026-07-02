"use client";
import React from 'react';

const riskToneMap: Record<string, string> = {
  Critical: 'border-red-200 bg-red-50 text-red-800',
  High: 'border-orange-200 bg-orange-50 text-orange-800',
  Medium: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const healthBarColor: Record<string, string> = {
  Healthy: '#10b981',
  Stable: '#f59e0b',
  'Needs Attention': '#f97316',
  'At Risk': '#ef4444',
};

const healthBadge: Record<string, string> = {
  Healthy: 'bg-emerald-100 text-emerald-800',
  Stable: 'bg-yellow-100 text-yellow-800',
  'Needs Attention': 'bg-orange-100 text-orange-800',
  'At Risk': 'bg-red-100 text-red-800',
};

export default function ProjectHealthRiskPanel({ healthScore, riskStatus, analytics }: { healthScore?: any; riskStatus?: any; analytics?: any }) {
  const riskTone = riskToneMap[riskStatus?.level] ?? riskToneMap.Low;

  return (
    <div className="space-y-6">
      <div className="rounded bg-white p-6 shadow">
        <h3 className="text-lg font-semibold mb-3">Health Score</h3>
        {healthScore ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-5xl font-bold">{healthScore.score}%</div>
                <div className="mt-1 text-sm text-slate-500">{healthScore.category}</div>
              </div>
              <div className={`rounded-full px-4 py-2 text-sm font-semibold ${healthBadge[healthScore.category] ?? 'bg-slate-100 text-slate-800'}`}>{healthScore.category}</div>
            </div>
            <div className="rounded-full bg-slate-200 h-3 overflow-hidden">
              <div style={{ width: `${healthScore.score}%`, background: healthBarColor[healthScore.category] ?? '#94a3b8', height: '100%' }} />
            </div>
            {healthScore.breakdown ? (
              <div className="grid gap-3 text-sm text-slate-600">
                <div>Milestone completion: {healthScore.breakdown.milestoneCompletion}%</div>
                <div>Deadline compliance: {healthScore.breakdown.deadlineCompliance}%</div>
                <div>Submission consistency: {healthScore.breakdown.submissionConsistency}%</div>
                <div>Supervisor engagement: {healthScore.breakdown.supervisorEngagement}%</div>
                <div>Project activity: {healthScore.breakdown.projectActivity}%</div>
              </div>
            ) : (
              <p className="text-slate-500">Health score available, breakdown unavailable.</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Health score unavailable.</p>
        )}
      </div>

      <div className="rounded bg-white p-6 shadow">
        <h3 className="text-lg font-semibold mb-3">Risk Status</h3>
        {riskStatus ? (
          <div className="space-y-3">
            <div className={`rounded border p-4 text-sm font-semibold ${riskTone}`}>Level: {riskStatus.level}</div>
            <p className="mt-2 text-sm text-slate-500">Risk score: {riskStatus.score}%</p>
            <p className="text-gray-600">{riskStatus.note}</p>
            {riskStatus.reasons?.length ? (
              <ul className="space-y-1 text-sm text-slate-600">
                {riskStatus.reasons.map((reason: string, index: number) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            ) : null}
            <div className="rounded border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold">Student alert</div>
              <p>{riskStatus.alerts.student}</p>
              <div className="font-semibold mt-3">Supervisor alert</div>
              <p>{riskStatus.alerts.supervisor}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Risk status unavailable.</p>
        )}
      </div>

      <div className="rounded bg-white p-6 shadow">
        <h3 className="text-lg font-semibold mb-3">Analytics Summary</h3>
        {analytics ? (
          <div className="grid gap-3">
            <div className="rounded border border-gray-100 p-4">
              <div className="text-sm text-gray-500">On-time milestones</div>
              <div className="mt-2 text-xl font-semibold">{analytics.onTimeMilestones}%</div>
            </div>
            <div className="rounded border border-gray-100 p-4">
              <div className="text-sm text-gray-500">Pending approvals</div>
              <div className="mt-2 text-xl font-semibold">{analytics.pendingApprovals}</div>
            </div>
            <div className="rounded border border-gray-100 p-4">
              <div className="text-sm text-gray-500">Overdue tasks</div>
              <div className="mt-2 text-xl font-semibold">{analytics.overdueTasks}</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Analytics unavailable.</p>
        )}
      </div>
    </div>
  );
}
