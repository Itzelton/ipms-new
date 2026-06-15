import { apiGet, apiPost, apiPatch } from './api';

export type EvidenceType =
  | 'DOCUMENT'
  | 'GITHUB'
  | 'WEBSITE'
  | 'APK'
  | 'SCREENSHOT'
  | 'DEMO_VIDEO'
  | 'MEETING_RECORD';

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISION_REQUIRED';

export async function getSubmissions() {
  try {
    return await apiGet('/submissions');
  } catch (error) {
    return [];
  }
}

export async function getSubmissionVersions(submissionId: string) {
  try {
    return await apiGet(`/submissions/${submissionId}/versions`);
  } catch (error) {
    return [];
  }
}

export async function createSubmission(payload: any) {
  return await apiPost('/submissions', payload);
}

export async function updateSubmission(submissionId: string, payload: any) {
  return await apiPatch(`/submissions/${submissionId}`, payload);
}

export async function createSubmissionVersion(submissionId: string, payload: any) {
  return await apiPost(`/submissions/${submissionId}/versions`, payload);
}
