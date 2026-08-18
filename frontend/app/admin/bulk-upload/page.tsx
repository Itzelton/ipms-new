"use client";
import React, { useRef, useState } from 'react';
import { apiPost } from '../../../services/api';

type ParsedRow = { firstName: string; lastName: string; email: string; role: string; error?: string };
type Result = { success: number; failed: number; errors: string[] };

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    if (!row.email) return { ...row, error: 'Missing email' };
    if (!row.firstname && !row['first name'] && !row['first_name']) return { ...row, error: 'Missing first name' };
    return {
      firstName: row.firstname || row['first name'] || row['first_name'] || '',
      lastName: row.lastname || row['last name'] || row['last_name'] || '',
      email: row.email || '',
      role: (row.role || 'STUDENT').toUpperCase(),
    };
  }).filter(r => r.email);
}

const TEMPLATE = `firstName,lastName,email,role\nJane,Smith,jane.smith@uni.edu,STUDENT\nJohn,Doe,john.doe@uni.edu,STUDENT`;

export default function AdminBulkUploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [fileName, setFileName] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('Welcome123!');

  function handleFile(file: File) {
    setResult(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) handleFile(file);
  }

  async function upload() {
    if (!rows.length || !defaultPassword) return;
    setUploading(true);
    let success = 0; const errors: string[] = [];
    for (const row of rows.filter(r => !r.error)) {
      try {
        await apiPost('/users', { firstName: row.firstName, lastName: row.lastName, email: row.email, password: defaultPassword, roles: [row.role] });
        success++;
      } catch (e: any) {
        errors.push(`${row.email}: ${e?.message || 'failed'}`);
      }
    }
    setResult({ success, failed: errors.length, errors });
    setUploading(false);
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ipms-bulk-upload-template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const validRows = rows.filter(r => !r.error);
  const invalidRows = rows.filter(r => r.error);

  return (
    <div className="space-y-6">
      <header className="card-static p-6">
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">Admin</span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Bulk Upload</h2>
        <p className="mt-1 text-sm text-slate-500">Upload a CSV to create multiple student or supervisor accounts at once.</p>
      </header>

      {result && (
        <div className={`card p-5 border ${result.failed === 0 ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
          <p className="text-sm font-semibold text-slate-800">
            Upload complete — {result.success} succeeded{result.failed > 0 ? `, ${result.failed} failed` : ''}.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.map((e, i) => <li key={i} className="text-xs text-rose-700">{e}</li>)}
            </ul>
          )}
          <button onClick={() => { setResult(null); setRows([]); setFileName(''); }} className="mt-3 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
            Upload another
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
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
            <input ref={fileRef} type="file" accept=".csv" className="sr-only" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {/* Preview */}
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
                  <thead><tr className="border-b border-slate-100 bg-slate-50/60">{['First Name','Last Name','Email','Role','Status'].map(h => <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.map((r, i) => (
                      <tr key={i} className={r.error ? 'bg-rose-50/40' : ''}>
                        <td className="px-4 py-2.5 text-slate-700">{r.firstName}</td>
                        <td className="px-4 py-2.5 text-slate-700">{r.lastName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{r.email}</td>
                        <td className="px-4 py-2.5"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{r.role}</span></td>
                        <td className="px-4 py-2.5">{r.error ? <span className="text-rose-600">{r.error}</span> : <span className="text-emerald-600">OK</span>}</td>
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
          <div className="card p-5 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Settings</p>
            <div>
              <label className="block mb-1 text-xs font-semibold text-slate-500">Default password</label>
              <input value={defaultPassword} onChange={e => setDefaultPassword(e.target.value)} className="input w-full" placeholder="Default password for new accounts" />
              <p className="mt-1 text-[11px] text-slate-400">Users should change this after first login.</p>
            </div>
            <button
              onClick={upload}
              disabled={uploading || validRows.length === 0 || !defaultPassword}
              className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 transition"
            >
              {uploading ? `Creating accounts… (${validRows.length})` : `Create ${validRows.length} account${validRows.length !== 1 ? 's' : ''}`}
            </button>
          </div>

          <div className="card p-5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">CSV Format</p>
            <p className="text-xs text-slate-500">Required columns: <code className="rounded bg-slate-100 px-1 py-0.5">firstName, lastName, email</code><br />Optional: <code className="rounded bg-slate-100 px-1 py-0.5">role</code> (defaults to STUDENT)</p>
            <button onClick={downloadTemplate} className="w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
              Download template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
