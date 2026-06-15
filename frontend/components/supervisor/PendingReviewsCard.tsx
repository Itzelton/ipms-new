"use client";
import React from 'react';

export default function PendingReviewsCard({ pendingReviews }: { pendingReviews?: any[] }) {
  if (!pendingReviews || pendingReviews.length === 0) {
    return <div className="p-4 bg-white rounded shadow">No pending reviews.</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-medium mb-3">Pending Reviews</h4>
      <div className="space-y-3">
        {pendingReviews.map((review) => (
          <div key={review.id} className="rounded border border-gray-100 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{review.title}</div>
              <div className="text-sm text-gray-500">{review.student} · Due {review.dueDate}</div>
            </div>
            <button className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Open Review</button>
          </div>
        ))}
      </div>
    </div>
  );
}
