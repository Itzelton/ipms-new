"use client";
import React from 'react';

export default function MilestonesList({ milestones }: { milestones?: any[] }) {
  if (!milestones || milestones.length === 0) return (
    <div className="p-4 bg-white rounded shadow">No milestones yet.</div>
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-medium mb-2">Milestones</h4>
      <ul className="space-y-2">
        {milestones.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-gray-500">Due {m.dueDate}</div>
            </div>
            <div className={`text-sm px-2 py-1 rounded ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {m.status}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
