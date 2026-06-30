"use client";
import React from 'react';

export default function RiskAlertsPanel({ alerts }: { alerts?: any[] }) {
  if (!alerts || alerts.length === 0) {
    return <div className="p-4 bg-white rounded shadow">No current risk alerts.</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Risk Alerts</h4>
        <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">{alerts.length}</span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded border border-red-100 bg-red-50 p-3">
            <div className="font-semibold">{alert.title}</div>
            <div className="text-sm text-gray-600">{alert.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
