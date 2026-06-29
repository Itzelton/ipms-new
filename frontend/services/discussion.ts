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
  try {
    return await apiGet(`/discussions/submission/${submissionId}`);
  } catch {
    return {
      id: `thread-${submissionId}`,
      title: 'Submission Discussion',
      submissionId,
      projectId: 'p1',
      messages: [],
    };
  }
}

export async function postDiscussionMessage(threadId: string, content: string, parentMessageId?: string) {
  try {
    return await apiPost(`/discussions/${threadId}/messages`, { content, parentMessageId });
  } catch {
    return { id: 'msg-temp', content, parentMessageId, createdAt: new Date().toISOString() };
  }
}
