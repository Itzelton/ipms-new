import { apiPost } from './api';

export async function sendChatMessage({
  message,
  projectId,
  roleHint,
}: {
  message: string;
  projectId?: string;
  roleHint?: 'STUDENT' | 'SUPERVISOR';
}) {
  return apiPost('/ai/assistant/chat', { message, projectId, roleHint });
}

