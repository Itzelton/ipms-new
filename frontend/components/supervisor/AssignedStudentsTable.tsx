"use client";
import React from 'react';

export default function AssignedStudentsTable({ students }: { students?: any[] }) {
  if (!students || students.length === 0) {
    return <div className="p-4 bg-white rounded shadow">No assigned students yet.</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow overflow-x-auto">
      <h4 className="font-medium mb-3">Assigned Students</h4>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b text-gray-500">
          <tr>
            <th className="pb-2 pr-4">Student</th>
            <th className="pb-2 pr-4">Project</th>
            <th className="pb-2 pr-4">Progress</th>
            <th className="pb-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="py-3 pr-4 font-medium">{student.name}</td>
              <td className="py-3 pr-4 text-gray-600">{student.project}</td>
              <td className="py-3 pr-4">{student.progress}%</td>
              <td className="py-3 pr-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${student.status === 'AT_RISK' ? 'bg-red-100 text-red-700' : student.status === 'ON_TRACK' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {student.status.replace('_', ' ')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
