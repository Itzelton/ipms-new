'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { apiPost } from '../../services/api';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ProjectContext = {
  title?: string;
  status?: string;
  milestones?: { title: string; status: string; dueDate: string }[];
  submissions?: { title?: string; status: string; createdAt: string }[];
  healthScore?: { score: number; classification: string } | null;
};

export default function ChatAssistant({
  role,
  projectId,
  userId,
  projectContext,
}: {
  role: 'STUDENT' | 'SUPERVISOR';
  projectId?: string;
  userId?: string;
  projectContext?: ProjectContext | null;
}) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        role === 'STUDENT'
          ? 'Hi! Ask me about your milestones, health score, or what to do next.'
          : 'Hi! Ask me which students are at risk, which projects need review, or to summarise recent activity.',
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasContext = !!(projectContext?.milestones?.length || projectContext?.submissions?.length);

  const suggested = useMemo(() => {
    if (role === 'SUPERVISOR') {
      return ['Students at risk?', 'Projects need review?', 'Summarise activity'];
    }
    if (hasContext) {
      const overdue = (projectContext?.milestones ?? []).filter(
        m => m.status !== 'COMPLETED' && new Date(m.dueDate) < new Date(),
      );
      if (overdue.length > 0) return [`What's overdue?`, 'What should I do next?', 'Explain my health score'];
      return ['Pending milestones?', 'What should I do next?', 'Explain my health score'];
    }
    return ['Pending milestones?', 'Why is my score low?', 'What should I do next?'];
  }, [role, hasContext, projectContext]);

  async function send(text?: string) {
    const content = (text ?? message).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content };
    setLoading(true);
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');

    // Build history from current messages (exclude welcome, cap at 8)
    const history = messages
      .filter(m => m.id !== 'welcome')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await apiPost('/ai/assistant/chat', {
        message: content,
        projectId,
        roleHint: role,
        userId,
        history,
        ...(projectContext ? { projectContext } : {}),
      });
      const answer = res?.answerText ?? 'No answer returned.';
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: answer }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: `Error: ${e?.message ?? 'unknown'}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 shadow-sm">
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">AI Assistant</p>
          {projectContext?.title && (
            <p className="text-[11px] text-slate-500 truncate">
              {projectContext.title}
              {projectContext.milestones?.length ? ` • ${projectContext.milestones.length} milestones` : ''}
              {projectContext.submissions?.length ? ` • ${projectContext.submissions.length} submissions` : ''}
            </p>
          )}
        </div>
        {loading && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0">
            <span className="inline-flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-0.5 scrollbar-hide">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-sm'
                  : 'text-slate-700 rounded-bl-sm'
              }`}
              style={m.role === 'assistant' ? {
                background: 'rgba(248,250,252,0.90)',
                border: '1px solid rgba(226,232,240,0.70)',
              } : undefined}
            >
              <AssistantText content={m.content} />
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-1.5">
        {suggested.map((s) => (
          <button
            key={s}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-40"
            style={{
              background: 'rgba(248,250,252,0.80)',
              border: '1px solid rgba(226,232,240,0.80)',
            }}
            disabled={loading}
            onClick={() => send(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: 'rgba(248,250,252,0.72)',
          border: '1px solid rgba(226,232,240,0.80)',
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 outline-none"
          placeholder={
            projectContext?.title
              ? `Ask about ${projectContext.title}…`
              : role === 'STUDENT'
              ? 'Ask about milestones, health score…'
              : 'Ask about risk, reviews…'
          }
          disabled={loading}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) send(); }}
        />
        <button
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white disabled:opacity-50 transition-opacity"
          onClick={() => send()}
          disabled={loading || !message.trim()}
          type="button"
          aria-label="Send"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AssistantText({ content }: { content: string }) {
  // Split on bullet lines or newlines for basic formatting
  const lines = content.split('\n').filter(l => l.trim() !== '');
  if (lines.length <= 1) return <span>{content}</span>;

  return (
    <span className="flex flex-col gap-1">
      {lines.map((line, i) => {
        const isBullet = /^[•\-*]\s/.test(line.trim());
        return (
          <span key={i} className={isBullet ? 'flex gap-1.5' : ''}>
            {isBullet && <span className="mt-0.5 flex-shrink-0 text-slate-400">•</span>}
            <span>{isBullet ? line.replace(/^[•\-*]\s/, '') : line}</span>
          </span>
        );
      })}
    </span>
  );
}
