"use client";
import React from 'react';

export default function AIInsightsCard({ insights }: { insights?: any[] }) {
  if (!insights || insights.length === 0) return (
    <div className="p-4 bg-white rounded shadow">No AI insights available</div>
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-medium mb-2">AI Insights</h4>
      <ul className="space-y-2 text-sm">
        {insights.map((i) => (
          <li key={i.id}>
            <div className="font-medium">{i.title}</div>
            <div className="text-gray-500">{i.summary}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
