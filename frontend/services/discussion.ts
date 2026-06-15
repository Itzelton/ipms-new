import { apiGet, apiPost } from './api';

export type DiscussionMessage = {
  id: string;
  content: string;
  author: { id: string; firstName?: string; lastName?: string; preferredName?: string };
  parentMessageId?: string | null;
  createdAt: string;
  replies?: DiscussionMessage[];
};

export type DiscussionThread = {
  id: string;
  title: string;
  submissionId?: string;
  projectId: string;
  messages: DiscussionMessage[];
};

export async function getDiscussionThreadForSubmission(submissionId: string) {
  return await apiGet(`/discussions/submission/${submissionId}`);
}

export async function postDiscussionMessage(threadId: string, content: string, parentMessageId?: string) {
  return await apiPost(`/discussions/${threadId}/messages`, { content, parentMessageId });
}
