"use client";
import React from 'react';

export default function RiskAlertsPanel({ alerts }: { alerts?: any[] }) {
  const isEmpty = !alerts || alerts.length === 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-red-600 shadow-sm">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Risk Alerts</p>
        </div>
        {!isEmpty && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
            {alerts!.length}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-slate-500">No active risk alerts</p>
          <p className="text-[11px] text-slate-400">All projects are on track</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {alerts!.map((alert) => (
            <li
              key={alert.id}
              className="flex items-start gap-3 rounded-xl px-3.5 py-3"
              style={{
                background: 'rgba(254,242,242,0.70)',
                border: '1px solid rgba(252,165,165,0.40)',
              }}
            >
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                <svg className="h-3 w-3 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-rose-800">{alert.title}</p>
                {alert.description && (
                  <p className="mt-0.5 text-[12px] text-rose-600">{alert.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
