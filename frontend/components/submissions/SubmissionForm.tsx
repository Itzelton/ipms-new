"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { EvidenceType } from '../../services/submission';
import { apiGet, apiUpload } from '../../services/api';

const evidenceOptions: { value: EvidenceType; label: string }[] = [
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'GITHUB', label: 'GitHub Repository' },
  { value: 'WEBSITE', label: 'Website URL' },
  { value: 'APK', label: 'APK File' },
  { value: 'SCREENSHOT', label: 'Screenshot' },
  { value: 'DEMO_VIDEO', label: 'Demo Video Link' },
  { value: 'MEETING_RECORD', label: 'Meeting Record' },
];

export default function SubmissionForm({ onSubmit, isSubmitting }: { onSubmit: (payload: any) => Promise<void>; isSubmitting: boolean }) {
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [milestones, setMilestones] = useState<{ id: string; title: string }[]>([]);
  const [projectId, setProjectId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('DOCUMENT');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiGet('/projects').then((data: any) => {
      const all = Array.isArray(data) ? data : [];
      const relevant = all.filter((p: any) => p.status !== 'CANCELLED' && p.status !== 'COMPLETED');
      setProjects(relevant);
      if (relevant.length > 0) setProjectId(relevant[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!projectId) { setMilestones([]); setMilestoneId(''); return; }
    Promise.allSettled([
      apiGet(`/milestones?projectId=${projectId}&limit=100`),
      apiGet(`/projects/${projectId}/details`),
    ]).then(([msRes, projRes]) => {
      // Try dedicated milestones endpoint first
      if (msRes.status === 'fulfilled' && Array.isArray(msRes.value) && msRes.value.length > 0) {
        setMilestones(msRes.value);
        setMilestoneId(msRes.value[0].id);
        return;
      }
      // Fall back to project details milestones
      if (projRes.status === 'fulfilled') {
        const ms: any[] = Array.isArray(projRes.value?.milestones) ? projRes.value.milestones : [];
        setMilestones(ms);
        setMilestoneId(ms.length > 0 ? ms[0].id : '');
      }
    });
  }, [projectId]);

  const fileLabel = useMemo(() => {
    if (evidenceType === 'APK') return 'APK File';
    if (evidenceType === 'SCREENSHOT') return 'Screenshot';
    if (evidenceType === 'DOCUMENT') return 'Document';
    return 'Optional File';
  }, [evidenceType]);

  async function handleSubmit(event: React.FormEvent, asDraft = false) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!details.trim()) nextErrors.details = 'Details are required.';
    if (!projectId) nextErrors.projectId = 'Select a project.';
    if (!asDraft && (evidenceType === 'GITHUB' || evidenceType === 'WEBSITE' || evidenceType === 'DEMO_VIDEO') && !sourceUrl.trim()) {
      nextErrors.sourceUrl = 'A URL is required for this evidence type.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    let uploadedUrl: string | null = sourceUrl || null;
    if (file && (evidenceType === 'DOCUMENT' || evidenceType === 'APK' || evidenceType === 'SCREENSHOT')) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload(`/storage/upload?folder=${projectId}`, fd);
      uploadedUrl = res?.url ?? null;
    }

    const metadata: any = {
      title,
      evidenceType,
      sourceUrl: uploadedUrl,
      meetingNotes: meetingNotes || null,
    };

    const payload: any = {
      projectId,
      content: details,
      evidenceType,
      fileUrl: uploadedUrl,
      metadata,
      status: asDraft ? 'DRAFT' : 'SUBMITTED',
    };
    if (milestoneId) payload.milestoneId = milestoneId;

    await onSubmit(payload);
    setTitle('');
    setDetails('');
    setSourceUrl('');
    setMeetingNotes('');
    setFile(null);
  }

  const fieldLabel = 'mb-1.5 block text-[12px] font-semibold text-slate-600';

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">New Submission</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={fieldLabel}>Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input" disabled={projects.length === 0}>
            {projects.length === 0
              ? <option value="">No projects found — submit a proposal first</option>
              : projects.map((p) => <option value={p.id} key={p.id}>{p.title}</option>)
            }
          </select>
          {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
        </div>
        <div>
          <label className={fieldLabel}>Milestone (optional)</label>
          <select value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} className="input" disabled={milestones.length === 0}>
            <option value="">— none —</option>
            {milestones.map((m) => <option value={m.id} key={m.id}>{m.title}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={fieldLabel}>Evidence Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Sprint 1 report" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label className={fieldLabel}>Evidence Type</label>
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value as EvidenceType)} className="input">
            {evidenceOptions.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={fieldLabel}>Description / Notes</label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className="input resize-none" placeholder="Describe what this evidence demonstrates…" />
        {errors.details && <p className="mt-1 text-xs text-red-600">{errors.details}</p>}
      </div>

      {(evidenceType === 'GITHUB' || evidenceType === 'WEBSITE' || evidenceType === 'DEMO_VIDEO') && (
        <div>
          <label className={fieldLabel}>URL</label>
          <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="input" placeholder="https://example.com" />
          {errors.sourceUrl && <p className="mt-1 text-xs text-red-600">{errors.sourceUrl}</p>}
        </div>
      )}

      {(evidenceType === 'DOCUMENT' || evidenceType === 'APK' || evidenceType === 'SCREENSHOT') && (
        <div>
          <label className={fieldLabel}>{fileLabel}</label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] text-slate-500 transition hover:border-sky-300 hover:bg-sky-50/40 hover:text-sky-600">
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="truncate">{file ? file.name : `Choose ${fileLabel}`}</span>
            <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          {file && <p className="mt-1 text-xs text-emerald-600">Ready: {file.name}</p>}
        </div>
      )}

      {evidenceType === 'MEETING_RECORD' && (
        <div>
          <label className={fieldLabel}>Meeting Notes</label>
          <textarea value={meetingNotes} onChange={(e) => setMeetingNotes(e.target.value)} rows={3} className="input resize-none" />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          disabled={isSubmitting || !projectId}
          onClick={(e) => handleSubmit(e as any, true)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !projectId}
          className="btn-primary px-5 py-2.5 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
