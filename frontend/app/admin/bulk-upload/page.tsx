"use client";
import React, { useRef, useState } from 'react';
import { apiPost } from '../../../services/api';

type ParsedRow = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  indexNumber?: string;
  level?: string;
  referenceNumber?: string;
  error?: string;
};

type Result = { success: number; failed: number; errors: string[] };

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });

    const role = (row.role || 'STUDENT').toUpperCase();
    const email = row.email || '';
    const firstName = row.firstname || row['firstname'] || '';
    const lastName = row.lastname || row['lastname'] || '';
    const indexNumber = row.indexnumber || row['indexnumber'] || '';
    const level = row.level || '';
    const referenceNumber = row.referencenumber || row['referencenumber'] || row.staffid || '';

    if (!email) return { firstName, lastName, email, role, error: 'Missing email' };
    if (role === 'STUDENT' && !firstName) return { firstName, lastName, email, role, error: 'Missing first name' };
    if (role === 'STUDENT' && !/^\d{8}$/.test(indexNumber)) return { firstName, lastName, email, role, indexNumber, level, error: 'Index number must be exactly 8 digits' };
    if (role === 'STUDENT' && !level) return { firstName, lastName, email, role, indexNumber, error: 'Missing level' };
    if (role === 'SUPERVISOR' && !referenceNumber) return { firstName, lastName, email, role, error: 'Missing staff ID / reference number' };

    return { firstName, lastName, email, role, indexNumber, level, referenceNumber };
  }).filter(r => r.email);
}

const STUDENT_TEMPLATE = `firstName,lastName,email,role,indexNumber,level\nKwame,Mensah,kwame@uni.edu,STUDENT,12345678,200\nAfia,Asante,afia@uni.edu,STUDENT,87654321,300`;
const SUPERVISOR_TEMPLATE = `email,role,referenceNumber\nlecturer@uni.edu,SUPERVISOR,LEC-0042`;

export default function AdminBulkUploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [fileName, setFileName] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<'student' | 'supervisor'>('student');

  function handleFile(file: File) {
    setResult(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setRows(parseCSV(e.target?.result as string));
    reader.readAsText(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) handleFile(file);
  }

  async function upload() {
    if (!validRows.length) return;
    setUploading(true);
    let success = 0;
    const errors: string[] = [];
    for (const row of validRows) {
      try {
        await apiPost('/users', {
          firstName: row.firstName || undefined,
          lastName: row.lastName || undefined,
          email: row.email,
          role: row.role,
          indexNumber: row.indexNumber || undefined,
          level: row.level || undefined,
          referenceNumber: row.referenceNumber || undefined,
        });
        success++;
      } catch (e: any) {
        errors.push(`${row.email}: ${e?.message || 'failed'}`);
      }
    }
    setResult({ success, failed: errors.length, errors });
    setUploading(false);
  }

  function downloadTemplate(type: 'student' | 'supervisor') {
    const content = type === 'student' ? STUDENT_TEMPLATE : SUPERVISOR_TEMPLATE;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipms-${type}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const validRows = rows.filter(r => !r.error);
  const invalidRows = rows.filter(r => r.error);

  return (
    <div className="space-y-6">
      <header className="card-static p-6">
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">Admin</span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Bulk Upload</h2>
        <p className="mt-1 text-sm text-slate-500">Upload a CSV to create multiple accounts at once. Each user receives an invitation email to set their password.</p>
      </header>

      {result && (
        <div className={`card p-5 border ${result.failed === 0 ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
          <p className="text-sm font-semibold text-slate-800">
            {result.success} account{result.success !== 1 ? 's' : ''} created{result.failed > 0 ? `, ${result.failed} failed` : ''}.
          </p>
          {result.success > 0 && (
            <p className="mt-1 text-xs text-slate-500">Invitation emails have been sent. Users must click the link to set their password.</p>
          )}
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.map((e, i) => <li key={i} className="text-xs text-rose-700">{e}</li>)}
            </ul>
          )}
          <button
            onClick={() => { setResult(null); setRows([]); setFileName(''); }}
            className="mt-3 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Upload another
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="card flex flex-col items-center justify-center gap-4 py-14 border-2 border-dashed border-slate-200 cursor-pointer hover:border-sky-300 hover:bg-sky-50/30 transition"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
              <svg className="h-7 w-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">{fileName || 'Drop CSV file here'}</p>
              <p className="mt-1 text-xs text-slate-400">or click to browse</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="sr-only"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-700">Preview ({rows.length} rows)</h3>
                <div className="flex gap-2 text-xs">
                  {validRows.length > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 font-semibold">{validRows.length} valid</span>}
                  {invalidRows.length > 0 && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 font-semibold">{invalidRows.length} invalid</span>}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {['Name', 'Email', 'Role', 'Index / Staff ID', 'Level', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.map((r, i) => (
                      <tr key={i} className={r.error ? 'bg-rose-50/40' : ''}>
                        <td className="px-4 py-2.5 text-slate-700">{[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-600">{r.email}</td>
                        <td className="px-4 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.role === 'SUPERVISOR' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'}`}>
                            {r.role}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">{r.indexNumber || r.referenceNumber || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500">{r.level || '—'}</td>
                        <td className="px-4 py-2.5">
                          {r.error
                            ? <span className="text-rose-600">{r.error}</span>
                            : <span className="text-emerald-600 font-medium">✓ Valid</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Upload action */}
          <div className="card p-5 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Upload</p>
            <div className="rounded-xl bg-sky-50 border border-sky-100 px-4 py-3 text-[12px] text-sky-800">
              Each created account receives an invitation email. The user clicks the link to set their own password.
            </div>
            <button
              onClick={upload}
              disabled={uploading || validRows.length === 0}
              className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 transition"
            >
              {uploading
                ? `Creating accounts…`
                : validRows.length > 0
                  ? `Create ${validRows.length} account${validRows.length !== 1 ? 's' : ''}`
                  : 'Upload a CSV first'}
            </button>
          </div>

          {/* Templates */}
          <div className="card p-5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">CSV Templates</p>

            <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
              {(['student', 'supervisor'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTemplate(t)}
                  className={`flex-1 rounded-lg py-1.5 text-[12px] font-semibold transition ${activeTemplate === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                >
                  {t === 'student' ? 'Student' : 'Supervisor'}
                </button>
              ))}
            </div>

            {activeTemplate === 'student' ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Required: <code className="rounded bg-slate-100 px-1">firstName, lastName, email, indexNumber (8 digits), level</code></p>
                <p className="text-xs text-slate-500">Optional: <code className="rounded bg-slate-100 px-1">role</code> (defaults to STUDENT)</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Required: <code className="rounded bg-slate-100 px-1">email, referenceNumber</code></p>
                <p className="text-xs text-slate-500">Supervisors set their own name after clicking the invite link.</p>
              </div>
            )}

            <button
              onClick={() => downloadTemplate(activeTemplate)}
              className="w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Download {activeTemplate} template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
