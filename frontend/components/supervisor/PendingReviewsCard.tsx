"use client";
import React from 'react';

function fmtDate(d: string) {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(d));
  } catch { return d; }
}

export default function PendingReviewsCard({ pendingReviews }: { pendingReviews?: any[] }) {
  const isEmpty = !pendingReviews || pendingReviews.length === 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 shadow-sm">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Pending Reviews</p>
        </div>
        {!isEmpty && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-600">
            {pendingReviews!.length}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-slate-500">Review queue is clear</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {pendingReviews!.map((review) => (
            <li key={review.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-slate-800">{review.title}</p>
                <p className="text-[11px] text-slate-400">{review.student} · Due {fmtDate(review.dueDate)}</p>
              </div>
              <button className="flex-shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-violet-700 transition-colors">
                Review
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
