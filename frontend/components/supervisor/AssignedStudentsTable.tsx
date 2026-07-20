"use client";
import React from 'react';

const statusStyle: Record<string, string> = {
  AT_RISK:  'bg-rose-100 text-rose-700',
  ON_TRACK: 'bg-emerald-100 text-emerald-700',
  ACTIVE:   'bg-sky-100 text-sky-700',
  PENDING:  'bg-amber-100 text-amber-700',
};

export default function AssignedStudentsTable({ students }: { students?: any[] }) {
  if (!students || students.length === 0) return (
    <div className="card p-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">No students assigned yet</p>
      </div>
    </div>
  );

  return (
    <div className="card p-6">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Assigned Students</p>
      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-left text-[13px]">
          <thead>
            <tr>
              {['Student', 'Project', 'Progress', 'Status'].map((h) => (
                <th key={h} className="pb-3 pr-4 pl-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const badge = statusStyle[student.status] ?? 'bg-slate-100 text-slate-600';
              return (
                <tr key={student.id} className="group transition-colors hover:bg-slate-50/60">
                  <td className="py-3 pr-4 pl-2 font-medium text-slate-800">{student.name}</td>
                  <td className="py-3 pr-4 text-slate-500 max-w-[160px] truncate">{student.project}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-slate-600">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                      {(student.status ?? '').replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
