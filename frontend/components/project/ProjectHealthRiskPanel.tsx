"use client";
import React from 'react';

const riskColors: Record<string, { badge: string; bar: string }> = {
  Critical: { badge: 'bg-red-100 text-red-700 border-red-200',    bar: 'bg-red-500' },
  High:     { badge: 'bg-orange-100 text-orange-700 border-orange-200', bar: 'bg-orange-500' },
  Medium:   { badge: 'bg-amber-100 text-amber-700 border-amber-200',   bar: 'bg-amber-400' },
  Low:      { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
};

const healthColors: Record<string, { bar: string; score: string }> = {
  'Healthy':         { bar: 'bg-emerald-500', score: 'text-emerald-600' },
  'Stable':          { bar: 'bg-amber-400',   score: 'text-amber-600' },
  'Needs Attention': { bar: 'bg-orange-500',  score: 'text-orange-600' },
  'At Risk':         { bar: 'bg-red-500',     score: 'text-red-600' },
};

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold tabular-nums text-slate-700">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-300 transition-all duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-slate-400">{label}</p>
      <p className="text-lg font-bold tabular-nums text-slate-800">{value}</p>
    </div>
  );
}

export default function ProjectHealthRiskPanel({ healthScore, riskStatus, analytics }: { healthScore?: any; riskStatus?: any; analytics?: any }) {
  const hc = healthColors[healthScore?.category] ?? healthColors['Stable'];
  const rc = riskColors[riskStatus?.level] ?? riskColors.Low;

  return (
    <div className="space-y-4">

      {/* Health Score */}
      <div className="card p-5 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Health score</p>
        {healthScore ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-4xl font-extrabold tabular-nums ${hc.score}`}>{healthScore.score}</span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                healthColors[healthScore.category]
                  ? `bg-${healthScore.category === 'Healthy' ? 'emerald' : healthScore.category === 'Stable' ? 'amber' : healthScore.category === 'Needs Attention' ? 'orange' : 'red'}-100 text-${healthScore.category === 'Healthy' ? 'emerald' : healthScore.category === 'Stable' ? 'amber' : healthScore.category === 'Needs Attention' ? 'orange' : 'red'}-700`
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {healthScore.category}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full transition-all duration-500 ${hc.bar}`} style={{ width: `${healthScore.score}%` }} />
            </div>
            {healthScore.breakdown && (
              <div className="space-y-2.5 pt-1">
                <BreakdownRow label="Milestone completion"    value={healthScore.breakdown.milestoneCompletion} />
                <BreakdownRow label="Deadline compliance"     value={healthScore.breakdown.deadlineCompliance} />
                <BreakdownRow label="Submission consistency"  value={healthScore.breakdown.submissionConsistency} />
                <BreakdownRow label="Supervisor engagement"   value={healthScore.breakdown.supervisorEngagement} />
                <BreakdownRow label="Project activity"        value={healthScore.breakdown.projectActivity} />
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">Health score unavailable.</p>
        )}
      </div>

      {/* Risk Status */}
      <div className="card p-5 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Risk status</p>
        {riskStatus ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${rc.badge}`}>{riskStatus.level} risk</span>
              <span className="text-[11px] tabular-nums text-slate-400">Score: {riskStatus.score}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full transition-all duration-500 ${rc.bar}`} style={{ width: `${riskStatus.score}%` }} />
            </div>
            {riskStatus.reasons?.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {riskStatus.reasons.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
                    <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${rc.bar}`} />
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">Risk status unavailable.</p>
        )}
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="card p-5 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Analytics</p>
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="On-time"   value={`${analytics.onTimeMilestones ?? 0}%`} />
            <StatBox label="Pending"   value={analytics.pendingApprovals ?? 0} />
            <StatBox label="Overdue"   value={analytics.overdueTasks ?? 0} />
          </div>
        </div>
      )}
    </div>
  );
}
