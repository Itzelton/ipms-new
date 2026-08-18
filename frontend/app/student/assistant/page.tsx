"use client";
import React, { useEffect, useState, useRef } from 'react';
import { apiPost, apiGet } from '../../../services/api';
import { useAuth } from '../../../components/auth/auth-context';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'What should I do next?',
  'Explain my health score',
  'What stages are left?',
  'Tips for my proposal',
  'How do revisions work?',
];

export default function StudentAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet('/projects')
      .then((data: any[]) => { if (data?.[0]?.id) setProjectId(data[0].id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);
    const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
    try {
      const res = await apiPost('/ai/assistant/chat', {
        message: content,
        projectId,
        roleHint: 'STUDENT',
        userId: user?.id,
        history,
      });
      setMessages((p) => [...p, { id: crypto.randomUUID(), role: 'assistant', content: res?.answerText ?? 'No response.' }]);
    } catch (e: any) {
      setMessages((p) => [...p, { id: crypto.randomUUID(), role: 'assistant', content: `Error: ${e?.message ?? 'unknown'}` }]);
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[800px]">
      {/* Header */}
      <div className="card-static p-5 mb-4 flex items-center gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 shadow-sm">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">AI Assistant</h2>
          <p className="text-xs text-slate-500">Ask me anything about your project, stages, or deadlines.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="card flex-1 overflow-y-auto p-5 flex flex-col gap-3 mb-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100">
              <svg className="h-8 w-8 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">How can I help?</p>
              <p className="mt-1 text-xs text-slate-400">Ask about your project stages, submissions, or next steps.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:text-slate-900 disabled:opacity-40"
                  style={{ background: 'rgba(248,250,252,0.9)', border: '1px solid rgba(226,232,240,0.9)' }}
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600">
                <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-sm'
                  : 'text-slate-700 rounded-bl-sm'
              }`}
              style={m.role === 'assistant' ? { background: 'rgba(248,250,252,0.95)', border: '1px solid rgba(226,232,240,0.8)' } : undefined}
            >
              {m.content.split('\n').filter(l => l.trim()).map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600">
              <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3"
              style={{ background: 'rgba(248,250,252,0.95)', border: '1px solid rgba(226,232,240,0.8)' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="card p-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about your project…"
          disabled={loading}
          className="flex-1 bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 outline-none px-2"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white disabled:opacity-50 transition-opacity"
          aria-label="Send"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
