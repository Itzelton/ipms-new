"use client";
import React from 'react';

function RecommendList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[12px] text-slate-600">
          <span className={`mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${color}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ProjectRecommendationsPanel({ recommendations }: { recommendations?: any }) {
  if (!recommendations) return null;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Recommendations</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Auto-generated</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[12px] font-semibold text-slate-700">For the student</p>
          <RecommendList items={recommendations.student ?? []} color="bg-sky-400" />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-[12px] font-semibold text-slate-700">For the supervisor</p>
          <RecommendList items={recommendations.supervisor ?? []} color="bg-violet-400" />
        </div>

        {recommendations.summary && (
          <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500">
            {recommendations.summary}
          </div>
        )}
      </div>
    </div>
  );
}
