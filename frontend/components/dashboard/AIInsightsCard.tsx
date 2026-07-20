"use client";
import React from 'react';

export default function AIInsightsCard({ insights }: { insights?: any[] }) {
  if (!insights || insights.length === 0) return (
    <div className="card p-6">
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100">
          <svg className="h-6 w-6 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No insights yet</p>
        <p className="mt-1 text-xs text-slate-400">AI will surface recommendations as you work</p>
      </div>
    </div>
  );

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 shadow-sm">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">AI Insights</p>
      </div>

      <ul className="divide-y divide-slate-100">
        {insights.map((i) => (
          <li key={i.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
              <div>
                <p className="text-[13px] font-medium text-slate-800">{i.title}</p>
                {i.summary && (
                  <p className="mt-0.5 text-[12px] text-slate-500 line-clamp-2">{i.summary}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
