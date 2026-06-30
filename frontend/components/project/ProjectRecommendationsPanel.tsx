"use client";
import React from 'react';

export default function ProjectRecommendationsPanel({ recommendations }: { recommendations?: any }) {
  if (!recommendations) {
    return (
      <div className="rounded bg-white p-6 shadow">
        <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
        <p className="text-gray-600">Recommendations are being generated for this project.</p>
      </div>
    );
  }

  return (
    <div className="rounded bg-white p-6 shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Recommendations</h3>
          <p className="text-sm text-slate-500 mt-1">Actionable guidance based on project activity and risk.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">Auto-generated</span>
      </div>

      <div className="mt-5 grid gap-5">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-700 mb-2">Student</div>
          <ul className="space-y-2 text-sm text-slate-600">
            {recommendations.student?.map((item: string, index: number) => (
              <li key={`student-${index}`} className="list-disc pl-4">{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-700 mb-2">Supervisor</div>
          <ul className="space-y-2 text-sm text-slate-600">
            {recommendations.supervisor?.map((item: string, index: number) => (
              <li key={`supervisor-${index}`} className="list-disc pl-4">{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-500">
          <div className="font-semibold text-slate-700">Summary</div>
          <p className="mt-2">{recommendations.summary}</p>
        </div>
      </div>
    </div>
  );
}
