"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { EvidenceType, SubmissionStatus } from '../../services/submission';
import { apiGet } from '../../services/api';

const evidenceOptions: { value: EvidenceType; label: string }[] = [
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'GITHUB', label: 'GitHub Repository' },
  { value: 'WEBSITE', label: 'Website URL' },
  { value: 'APK', label: 'APK File' },
  { value: 'SCREENSHOT', label: 'Screenshot' },
  { value: 'DEMO_VIDEO', label: 'Demo Video Link' },
  { value: 'MEETING_RECORD', label: 'Meeting Record' },
];

const statusOptions: { value: SubmissionStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REVISION_REQUIRED', label: 'Revision Required' },
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
  const [status, setStatus] = useState<SubmissionStatus>('DRAFT');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiGet('/projects').then((data: any) => {
      const list = Array.isArray(data) ? data : [];
      setProjects(list);
      if (list.length > 0) setProjectId(list[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!projectId) { setMilestones([]); setMilestoneId(''); return; }
    apiGet(`/projects/${projectId}/details`).then((data: any) => {
      const ms: { id: string; title: string }[] = data?.milestones ?? [];
      setMilestones(ms);
      setMilestoneId(ms.length > 0 ? ms[0].id : '');
    }).catch(() => { setMilestones([]); setMilestoneId(''); });
  }, [projectId]);

  const fileLabel = useMemo(() => {
    if (evidenceType === 'APK') return 'APK File';
    if (evidenceType === 'SCREENSHOT') return 'Screenshot';
    if (evidenceType === 'DOCUMENT') return 'Document';
    return 'Optional File';
  }, [evidenceType]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!details.trim()) nextErrors.details = 'Details are required.';
    if (!projectId) nextErrors.projectId = 'Select a project.';
    if ((evidenceType === 'GITHUB' || evidenceType === 'WEBSITE' || evidenceType === 'DEMO_VIDEO') && !sourceUrl.trim()) {
      nextErrors.sourceUrl = 'A URL is required for this evidence type.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const metadata: any = {
      title,
      evidenceType,
      sourceUrl: sourceUrl || null,
      meetingNotes: meetingNotes || null,
    };

    const payload: any = {
      projectId,
      content: details,
      evidenceType,
      fileUrl: sourceUrl || null,
      metadata,
      status,
    };
    if (milestoneId) payload.milestoneId = milestoneId;

    await onSubmit(payload);
    setTitle('');
    setDetails('');
    setSourceUrl('');
    setMeetingNotes('');
    setFile(null);
    setStatus('DRAFT');
  }

  return (
    <form onSubmit={handleSubmit} className="rounded bg-white p-6 shadow">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" disabled={projects.length === 0}>
            {projects.length === 0
              ? <option value="">Loading projects...</option>
              : projects.map((p) => <option value={p.id} key={p.id}>{p.title}</option>)
            }
          </select>
          {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Milestone (optional)</label>
          <select value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" disabled={milestones.length === 0}>
            <option value="">— none —</option>
            {milestones.map((m) => <option value={m.id} key={m.id}>{m.title}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Evidence Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Evidence Type</label>
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value as EvidenceType)} className="mt-1 w-full rounded border px-3 py-2">
            {evidenceOptions.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Description / Notes</label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} className="mt-1 w-full rounded border px-3 py-2" />
        {errors.details && <p className="mt-1 text-sm text-red-600">{errors.details}</p>}
      </div>

      {(evidenceType === 'GITHUB' || evidenceType === 'WEBSITE' || evidenceType === 'DEMO_VIDEO') && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">URL</label>
          <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" placeholder="https://example.com" />
          {errors.sourceUrl && <p className="mt-1 text-sm text-red-600">{errors.sourceUrl}</p>}
        </div>
      )}

      {(evidenceType === 'DOCUMENT' || evidenceType === 'APK' || evidenceType === 'SCREENSHOT') && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">{fileLabel}</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 w-full" />
          <p className="mt-1 text-xs text-gray-400">File upload to storage is not yet wired — paste a URL in the URL field for now.</p>
        </div>
      )}

      {evidenceType === 'MEETING_RECORD' && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Meeting Notes</label>
          <textarea value={meetingNotes} onChange={(e) => setMeetingNotes(e.target.value)} rows={3} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Submission Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as SubmissionStatus)} className="mt-1 w-full rounded border px-3 py-2">
          {statusOptions.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-500">Upload evidence and create a versioned submission entry.</div>
        <button type="submit" disabled={isSubmitting || !projectId} className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Submitting...' : 'Submit Evidence'}
        </button>
      </div>
    </form>
  );
}
