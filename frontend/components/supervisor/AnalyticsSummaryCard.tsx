"use client";
import React from 'react';

export default function AnalyticsSummaryCard({ summary }: { summary?: any }) {
  if (!summary) {
    return <div className="p-4 bg-white rounded shadow">Analytics not available.</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-medium mb-4">Analytics Summary</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Active Projects</div>
          <div className="mt-2 text-2xl font-semibold">{summary.activeProjects}</div>
        </div>
        <div className="rounded border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Review Queue</div>
          <div className="mt-2 text-2xl font-semibold">{summary.reviewQueue}</div>
        </div>
        <div className="rounded border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Average Turnaround</div>
          <div className="mt-2 text-2xl font-semibold">{summary.averageTurnaround}</div>
        </div>
        <div className="rounded border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Risk Projects</div>
          <div className="mt-2 text-2xl font-semibold">{summary.riskProjects}</div>
        </div>
      </div>
    </div>
  );
}
