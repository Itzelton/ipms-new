'use client';

import React, { useMemo, useState } from 'react';
import { apiPost } from '../../services/api';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatAssistant({
  role,
  projectId,
}: {
  role: 'STUDENT' | 'SUPERVISOR';
  projectId?: string;
}) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        role === 'STUDENT'
          ? 'Student assistant ready. Ask: “What milestones are pending?”, “Why is my health score low?”, or “What should I do next?”'
          : 'Supervisor assistant ready. Ask: “Which students are at risk?”, “Which projects need review?”, or “Summarize recent activity.”',
    },
  ]);

  const suggested = useMemo(() => {
    return role === 'STUDENT'
      ? ['What milestones are pending?', 'Why is my health score low?', 'What should I do next?']
      : ['Which students are at risk?', 'Which projects need review?', 'Summarize recent activity'];
  }, [role]);

  async function send(text?: string) {
    const content = (text ?? message).trim();
    if (!content || loading) return;

    setLoading(true);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');

    try {
      const res = await apiPost('/ai/assistant/chat', {
        message: content,
        projectId,
        roleHint: role,
      });

      const answer = res?.answerText ?? 'No answer returned.';
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Request failed: ${e?.message ?? 'unknown error'}`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="font-medium">AI Assistant</h4>
        <span className="text-xs text-gray-500">{role}</span>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === 'user'
                ? 'text-right'
                : 'text-left'
            }
          >
            <div
              className={
                m.role === 'user'
                  ? 'inline-block px-3 py-2 rounded-lg bg-blue-600 text-white'
                  : 'inline-block px-3 py-2 rounded-lg bg-gray-100 text-gray-900'
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder={
              role === 'STUDENT'
                ? 'Ask about milestones, health score, or next steps...'
                : 'Ask about risk, review, or activity...'
            }
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />
          <button
            className="px-3 py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-60"
            onClick={() => send()}
            disabled={loading}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {suggested.map((s) => (
            <button
              key={s}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
              disabled={loading}
              onClick={() => send(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

