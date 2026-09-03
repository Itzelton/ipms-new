"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { apiGet, apiPost } from '../../../services/api';
import { useAuth } from '../../../components/auth/auth-context';
import { useSocket } from '../../../hooks/useSocket';

type Message = {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  deletedAt?: string | null;
  _pending?: boolean;
};
type Channel = { id: string; name: string };

function timeFmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  const [supervisorName, setSupervisorName] = useState('Supervisor');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { joinChannel, on, off } = useSocket(user?.id ?? null, []);

  // Join channel room and listen for real-time messages
  useEffect(() => {
    if (!channel?.id) return;
    joinChannel(channel.id);
    const handler = ({ channelId: cid, message }: any) => {
      if (cid !== channel.id) return;
      setMessages(prev => {
        const withoutPending = prev.filter(m => !(m._pending && m.content === message.content));
        if (withoutPending.some(m => m.id === message.id)) return withoutPending;
        return [...withoutPending, message];
      });
    };
    on('message:new', handler);
    return () => { off('message:new', handler); };
  }, [channel?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve supervisor
  useEffect(() => {
    apiGet('/auth/me').then((me: any) => {
      const advisorId = me?.studentProfile?.advisorId;
      if (!advisorId) { setLoading(false); return; }
      setSupervisorId(advisorId);
      apiGet(`/users/${advisorId}`).then((sv: any) => {
        setSupervisorName(sv.preferredName || [sv.firstName, sv.lastName].filter(Boolean).join(' ') || sv.email);
      }).catch(() => {});
    }).catch(() => setLoading(false));
  }, []);

  // Open DM channel
  useEffect(() => {
    if (!supervisorId) return;
    apiGet(`/channels/dm/${supervisorId}`)
      .then((ch: any) => setChannel(ch))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [supervisorId]);

  const loadMessages = useCallback(() => {
    if (!channel?.id) return;
    apiGet(`/channels/${channel.id}/messages`)
      .then((data: any) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [channel?.id]);

  // Initial load + fallback poll (WebSocket handles real-time)
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function ensureChannel(): Promise<Channel> {
    if (channel) return channel;
    const ch = await apiGet(`/channels/dm/${supervisorId}`);
    setChannel(ch);
    return ch;
  }

  async function sendMessage() {
    if (!input.trim() || sending || !supervisorId) return;
    setSending(true);
    setSendError(null);
    const content = input.trim();
    setInput('');

    // Optimistic: show message immediately
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      content,
      authorId: user?.id ?? '',
      createdAt: new Date().toISOString(),
      _pending: true,
    }]);

    try {
      const ch = await ensureChannel();
      await apiPost(`/channels/${ch.id}/messages`, { content });
      // WebSocket delivers the real message and replaces the pending one
    } catch (e: any) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setSendError(e?.message || 'Failed to send message. Please try again.');
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  if (!loading && !supervisorId) {
    return (
      <div className="space-y-6">
        <header className="card-static p-6">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">Messages</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Messages</h2>
        </header>
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-500">No supervisor assigned yet.</p>
          <p className="mt-1 text-xs text-slate-400">You can message your supervisor once one is assigned by an admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[800px]">
      {/* Header */}
      <div className="card-static p-5 mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100">
          <svg className="h-5 w-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{supervisorName}</h2>
          <p className="text-xs text-slate-500">Direct message with your supervisor</p>
        </div>
      </div>

      {/* Messages */}
      <div className="card flex-1 overflow-y-auto p-5 flex flex-col gap-3 mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
              <svg className="h-7 w-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.filter(m => !m.deletedAt).map((m) => {
            const isMe = m.authorId === user?.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%]">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed transition-opacity ${
                      isMe
                        ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-sm'
                        : 'rounded-bl-sm border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    } ${m._pending ? 'opacity-60' : 'opacity-100'}`}
                  >
                    {m.content}
                  </div>
                  <p className={`mt-1 text-[10px] text-slate-400 ${isMe ? 'text-right' : 'text-left'}`}>
                    {m._pending ? 'Sending…' : timeFmt(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="card">
        {sendError && (
          <p className="px-4 pt-2 text-[11px] text-red-500">{sendError}</p>
        )}
        <div className="p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); if (sendError) setSendError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Message ${supervisorName}…`}
            disabled={sending || !supervisorId}
            className="flex-1 bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 outline-none px-2"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim() || !supervisorId}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white disabled:opacity-50 transition-opacity"
            aria-label="Send"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
