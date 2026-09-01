"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/auth-context';
import { useChannels, useMessages, useThreadReplies, Channel, Message } from '../../hooks/useChannels';
import { useSocket } from '../../hooks/useSocket';
import { apiGet, apiPatch } from '../../services/api';

// ── helpers ───────────────────────────────────────────────────────────────────

function displayName(u?: { firstName?: string; lastName?: string; email?: string } | null) {
  if (!u) return 'Unknown';
  const n = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return n || u.email || 'Unknown';
}

function initials(u?: { firstName?: string; lastName?: string; email?: string } | null) {
  if (!u) return '?';
  if (u.firstName) return (u.firstName[0] + (u.lastName?.[0] ?? '')).toUpperCase();
  return (u.email ?? '?')[0].toUpperCase();
}

function fmtTime(d: string) {
  try {
    const date = new Date(d);
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(date);
  } catch { return ''; }
}

function fmtDate(d: string) {
  try {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  } catch { return ''; }
}

function sameDay(a: string, b: string) {
  try { return new Date(a).toDateString() === new Date(b).toDateString(); } catch { return false; }
}

function sameGroup(a: Message, b: Message) {
  if (a.authorId !== b.authorId) return false;
  const diff = Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return diff < 5 * 60 * 1000; // within 5 min
}

const CHANNEL_ICON: Record<string, string> = {
  PROJECT_GENERAL: '#',
  PROJECT_FEEDBACK: '✦',
  ANNOUNCEMENT: '📢',
  DIRECT: '',
};

const COMMON_EMOJI = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

// ── sub-components ────────────────────────────────────────────────────────────

function Avatar({ user, size = 8 }: { user?: any; size?: number }) {
  const colors = ['from-sky-500 to-blue-600', 'from-violet-500 to-indigo-600', 'from-rose-400 to-pink-600', 'from-emerald-400 to-teal-600', 'from-amber-400 to-orange-500'];
  const idx = (user?.email?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div className={`flex h-${size} w-${size} flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colors[idx]} text-white font-semibold`}
      style={{ fontSize: size <= 7 ? 11 : 13 }}>
      {initials(user)}
    </div>
  );
}

function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return (
    <div ref={ref}
      className="absolute bottom-full mb-1 left-0 z-50 flex gap-1 p-1.5 rounded-xl shadow-lg border border-white/60"
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}>
      {COMMON_EMOJI.map((e) => (
        <button key={e} onClick={() => { onPick(e); onClose(); }}
          className="text-base hover:scale-125 transition-transform leading-none px-0.5">{e}</button>
      ))}
    </div>
  );
}

function MessageActions({ msg, meId, onEdit, onDelete, onReact, onReply }: {
  msg: Message; meId: string;
  onEdit: () => void; onDelete: () => void;
  onReact: (emoji: string) => void; onReply: () => void;
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  return (
    <div className="absolute -top-3 right-3 hidden group-hover:flex items-center gap-0.5 z-10
      rounded-xl px-1 py-0.5 shadow-md border border-white/60"
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)' }}>
      <div className="relative">
        <button onClick={() => setEmojiOpen((x) => !x)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">
          😊
        </button>
        {emojiOpen && <EmojiPicker onPick={onReact} onClose={() => setEmojiOpen(false)} />}
      </div>
      <button onClick={onReply}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
        title="Reply in thread">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      {msg.authorId === meId && (
        <>
          <button onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
            title="Edit">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 transition"
            title="Delete">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

function MessageBubble({ msg, isGrouped, meId, onEdit, onDelete, onReact, onOpenThread }: {
  msg: Message; isGrouped: boolean; meId: string;
  onEdit: (m: Message) => void;
  onDelete: (m: Message) => void;
  onReact: (m: Message, emoji: string) => void;
  onOpenThread: (m: Message) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const isMine = msg.authorId === meId;

  function startEdit() { setEditVal(msg.content); setEditing(true); }
  function submitEdit() { onEdit({ ...msg, content: editVal }); setEditing(false); }

  const reactionSummary = msg.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  const replyCount = msg.replies?.length ?? 0;

  if (msg.deletedAt) {
    return (
      <div className={`flex gap-3 px-4 ${isGrouped ? 'pt-0.5' : 'pt-3'}`}>
        {!isGrouped ? <Avatar user={msg.author} size={8} /> : <div className="w-8 flex-shrink-0" />}
        <div className="mt-0.5 text-[12px] text-slate-400 italic">Message deleted</div>
      </div>
    );
  }

  return (
    <div className={`group relative flex gap-3 px-4 py-0.5 hover:bg-slate-50/60 transition-colors ${isGrouped ? '' : 'mt-1'}`}>
      {!isGrouped
        ? <Avatar user={msg.author} size={8} />
        : <div className="w-8 flex-shrink-0 flex items-center justify-end pr-0.5">
            <span className="text-[9px] text-slate-300 opacity-0 group-hover:opacity-100">{fmtTime(msg.createdAt)}</span>
          </div>
      }
      <div className="min-w-0 flex-1">
        {!isGrouped && (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span className={`text-[13px] font-semibold ${isMine ? 'text-sky-700' : 'text-slate-800'}`}>
              {displayName(msg.author)}
            </span>
            <span className="text-[11px] text-slate-400">{fmtTime(msg.createdAt)}</span>
            {msg.editedAt && <span className="text-[10px] text-slate-400">(edited)</span>}
          </div>
        )}

        {editing ? (
          <div className="flex flex-col gap-1.5">
            <textarea
              className="input resize-none text-[13px] leading-relaxed"
              rows={2}
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); } if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
            <div className="flex gap-2 text-[11px]">
              <button onClick={submitEdit} className="btn-primary py-1 px-3 text-[11px]">Save</button>
              <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-slate-800 whitespace-pre-wrap break-words">{msg.content}</p>
        )}

        {Object.keys(reactionSummary).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.entries(reactionSummary).map(([emoji, count]) => {
              const reacted = msg.reactions.some((r) => r.userId === meId && r.emoji === emoji);
              return (
                <button key={emoji}
                  onClick={() => onReact(msg, emoji)}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                    reacted ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {emoji} {count}
                </button>
              );
            })}
          </div>
        )}

        {replyCount > 0 && (
          <button onClick={() => onOpenThread(msg)}
            className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-sky-600 hover:text-sky-700 transition">
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      <MessageActions
        msg={msg} meId={meId}
        onEdit={startEdit}
        onDelete={() => onDelete(msg)}
        onReact={(emoji) => onReact(msg, emoji)}
        onReply={() => onOpenThread(msg)}
      />
    </div>
  );
}

function MessageInput({ placeholder, onSend, onTyping }: {
  placeholder: string;
  onSend: (content: string) => void;
  onTyping?: () => void;
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const content = value.trim();
    if (!content) return;
    onSend(content);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    onTyping?.();
    // auto-grow
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`; }
  }

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100 transition"
      style={{ backdropFilter: 'blur(12px)' }}>
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="flex-1 resize-none bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 outline-none leading-relaxed"
        style={{ minHeight: 24, maxHeight: 160 }}
      />
      <button
        onClick={submit}
        disabled={!value.trim()}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition disabled:opacity-30"
        style={{ background: value.trim() ? 'linear-gradient(135deg,#0ea5e9,#2563eb)' : undefined, color: value.trim() ? '#fff' : '#94a3b8' }}
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </div>
  );
}

// ── DM person picker modal ────────────────────────────────────────────────────

type DirEntry = { id: string; name: string; email: string; role: string };

function NewDmModal({ meId, meRole, onStart, onClose }: {
  meId: string;
  meRole: string;
  onStart: (otherId: string, otherName: string) => void;
  onClose: () => void;
}) {
  const [people, setPeople] = useState<DirEntry[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

  useEffect(() => {
    fetch(`${API}/auth/directory`)
      .then((r) => r.json())
      .then((r) => {
        const list: DirEntry[] = Array.isArray(r) ? r : (r?.data ?? []);
        // Students can DM supervisors; supervisors can DM students
        const targetRole = meRole === 'STUDENT' ? 'SUPERVISOR' : 'STUDENT';
        setPeople(list.filter((u) => u.role === targetRole && u.id && u.id !== meId));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const filtered = query.trim()
    ? people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : people;

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
      <div ref={ref} className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[14px] font-semibold text-slate-800">New direct message</p>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="p-3 border-b border-slate-100">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={meRole === 'STUDENT' ? 'Search supervisors…' : 'Search students…'}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-sky-300"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {loading && <p className="px-4 py-6 text-center text-[12px] text-slate-400">Loading…</p>}
          {!loading && filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-[12px] text-slate-400">No one found.</p>
          )}
          {filtered.map((p) => (
            <button key={p.id} onClick={() => onStart(p.id, p.name)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition">
              <Avatar user={{ firstName: p.name.split(' ')[0], lastName: p.name.split(' ')[1], email: p.email }} size={8} />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-800 truncate">{p.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{p.role === 'SUPERVISOR' ? 'Supervisor' : 'Student'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Channel sidebar ───────────────────────────────────────────────────────────

function dmDisplayName(ch: Channel, meId: string): string {
  const other = ch.members?.find((m) => m.userId !== meId);
  if (!other?.user) return ch.name;
  const u = other.user;
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

function ChannelSidebar({ channels, activeId, meId, onSelect, onNewDm }: {
  channels: Channel[];
  activeId: string | null;
  meId: string;
  onSelect: (ch: Channel) => void;
  onNewDm: () => void;
}) {
  const projects = channels.filter((c) => ['PROJECT_GENERAL', 'PROJECT_FEEDBACK'].includes(c.type));
  const announcements = channels.filter((c) => c.type === 'ANNOUNCEMENT');
  const dms = channels.filter((c) => c.type === 'DIRECT');

  function Section({ label, items }: { label: string; items: Channel[] }) {
    return (
      <div className="mb-4">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        {items.map((ch) => {
          const label = ch.type === 'DIRECT' ? dmDisplayName(ch, meId) : ch.name;
          return (
            <button key={ch.id} onClick={() => onSelect(ch)}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[13px] font-medium transition ${
                activeId === ch.id ? 'bg-sky-100/80 text-sky-700' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-800'
              }`}>
              <span className="text-[12px] w-4 text-center flex-shrink-0 text-slate-400">{CHANNEL_ICON[ch.type] ?? '#'}</span>
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {ch.unread > 0 && (
                <span className="flex-shrink-0 rounded-full bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">{ch.unread > 9 ? '9+' : ch.unread}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.94)0%,rgba(238,242,255,0.90)100%)', borderRight: '1px solid rgba(226,232,240,0.50)' }}>
      <div className="p-4 pb-3 border-b border-slate-100/80">
        <p className="text-[15px] font-bold text-slate-800">Discussions</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Your workspaces</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {Object.entries(projects.reduce<Record<string, Channel[]>>((groups, channel) => {
          const key = channel.projectId ?? channel.id;
          (groups[key] ??= []).push(channel);
          return groups;
        }, {})).map(([projectId, items]) => (
          <Section key={projectId} label={items[0].project?.title ?? 'Project discussion'} items={items} />
        ))}
        {announcements.length > 0 && <Section label="Announcements" items={announcements} />}
        {dms.length > 0 && <Section label="Direct Messages" items={dms} />}
        {channels.length === 0 && (
          <p className="px-3 text-[12px] text-slate-400">No channels yet. They are created automatically when a project is set up.</p>
        )}
      </div>
      <div className="p-3 border-t border-slate-100">
        <button onClick={onNewDm}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-100 transition">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New direct message
        </button>
      </div>
    </aside>
  );
}

// ── Thread panel ──────────────────────────────────────────────────────────────

function ThreadPanel({ parentMsg, channelId, meId, onClose, onSend }: {
  parentMsg: Message;
  channelId: string;
  meId: string;
  onClose: () => void;
  onSend: (content: string, parentId: string) => void;
}) {
  const { replies, loading, loadReplies } = useThreadReplies(parentMsg.id);

  useEffect(() => { loadReplies(channelId, parentMsg.id); }, [parentMsg.id, channelId]); // eslint-disable-line

  return (
    <aside className="flex h-full flex-col overflow-hidden border-l border-slate-100"
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-[13px] font-semibold text-slate-800">Thread</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</p>
        </div>
        <button onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Parent message preview */}
      <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/50">
        <div className="flex items-start gap-2.5">
          <Avatar user={parentMsg.author} size={7} />
          <div>
            <p className="text-[12px] font-semibold text-slate-700">{displayName(parentMsg.author)}</p>
            <p className="text-[12px] text-slate-600 mt-0.5 line-clamp-3">{parentMsg.content}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="px-4 py-6 text-[12px] text-slate-400">Loading replies…</div>
        ) : replies.length === 0 ? (
          <div className="px-4 py-6 text-[12px] text-slate-400">No replies yet. Be the first!</div>
        ) : (
          replies.map((r, i) => (
            <div key={r.id} className="flex items-start gap-2.5 px-4 py-2">
              <Avatar user={r.author} size={7} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[12px] font-semibold text-slate-700">{displayName(r.author)}</span>
                  <span className="text-[10px] text-slate-400">{fmtTime(r.createdAt)}</span>
                </div>
                <p className="text-[12px] text-slate-700 whitespace-pre-wrap break-words">{r.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-slate-100">
        <MessageInput
          placeholder="Reply in thread…"
          onSend={(content) => onSend(content, parentMsg.id)}
        />
      </div>
    </aside>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────

export default function DiscussionsLayout({ userId, userName, role = 'STUDENT' }: { userId: string; userName: string; role?: string }) {
  const { channels, loading: chLoading, reload: reloadChannels, bumpUnread, clearUnread } = useChannels(userId);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [threadMsg, setThreadMsg] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; timer: any }>>({});
  const [dmModalOpen, setDmModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<{ title: string; milestones: Array<{ id: string; title: string; status: string }> } | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const {
    messages, loading: msgLoading, appendMessage, updateMessage, removeMessage, updateReactions,
    sendRest, editRest, deleteRest, reactRest,
  } = useMessages(activeChannel?.id ?? null);

  const channelIds = channels.map((c) => c.id);
  const socket = useSocket(userId, channelIds);

  // auto-select first channel
  useEffect(() => {
    if (!activeChannel && channels.length > 0) setActiveChannel(channels[0]);
  }, [channels]); // eslint-disable-line

  // join newly loaded channels
  useEffect(() => {
    channels.forEach((c) => socket.joinChannel(c.id));
  }, [channels.length]); // eslint-disable-line

  // wire socket events
  useEffect(() => {
    const offNew = socket.on('message:new', ({ channelId, message }: { channelId: string; message: Message }) => {
      if (channelId === activeChannel?.id) {
        appendMessage(message);
      } else {
        bumpUnread(channelId);
      }
    });

    const offEdited = socket.on('message:edited', ({ message }: { message: Message }) => {
      if (message.channelId === activeChannel?.id) updateMessage(message);
    });

    const offDeleted = socket.on('message:deleted', ({ messageId }: { messageId: string }) => {
      removeMessage(messageId);
    });

    const offReaction = socket.on('reaction:updated', ({ messageId, reactions }: any) => {
      updateReactions(messageId, reactions);
    });

    const offTypingStart = socket.on('typing:start', ({ channelId, userId: tId, userName: tName }: any) => {
      if (channelId !== activeChannel?.id || tId === userId) return;
      setTypingUsers((prev) => {
        const existing = prev[tId];
        if (existing) clearTimeout(existing.timer);
        return { ...prev, [tId]: { name: tName, timer: null } };
      });
    });

    const offTypingStop = socket.on('typing:stop', ({ userId: tId }: any) => {
      setTypingUsers((prev) => { const next = { ...prev }; delete next[tId]; return next; });
    });

    return () => { offNew(); offEdited(); offDeleted(); offReaction(); offTypingStart(); offTypingStop(); };
  }, [activeChannel?.id]); // eslint-disable-line

  useEffect(() => {
    if (!activeChannel?.projectId) { setActiveProject(null); return; }
    apiGet(`/projects/${activeChannel.projectId}/details`)
      .then((project) => setActiveProject({ title: project.title, milestones: project.milestones ?? [] }))
      .catch(() => setActiveProject(null));
  }, [activeChannel?.projectId]);

  // scroll to bottom on new messages
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // mark read when switching channels
  useEffect(() => {
    if (!activeChannel) return;
    clearUnread(activeChannel.id);
    socket.markRead(activeChannel.id);
    apiPatch(`/channels/${activeChannel.id}/read`, {}).catch(() => {});
  }, [activeChannel?.id]); // eslint-disable-line

  const typingNames = Object.values(typingUsers).map((t) => t.name);

  async function handleSend(content: string, parentId?: string) {
    if (!activeChannel) return;
    try {
      // send via REST (gateway will broadcast to others)
      await sendRest(activeChannel.id, content, parentId);
    } catch { /* ignore */ }
  }

  async function handleEdit(msg: Message) {
    if (!activeChannel) return;
    await editRest(activeChannel.id, msg.id, msg.content);
  }

  async function handleDelete(msg: Message) {
    if (!activeChannel) return;
    await deleteRest(activeChannel.id, msg.id);
  }

  async function handleReact(msg: Message, emoji: string) {
    if (!activeChannel) return;
    await reactRest(activeChannel.id, msg.id, emoji);
  }

  function handleTyping() {
    if (!activeChannel) return;
    socket.sendTyping(activeChannel.id, userName);
  }

  async function handleStartDm(otherId: string, otherName: string) {
    setDmModalOpen(false);
    try {
      const ch = await apiGet(`/channels/dm/${otherId}`);
      if (ch?.id) {
        await reloadChannels();
        socket.joinChannel(ch.id);
        // Give the channels list a moment to refresh then select the DM
        setTimeout(() => {
          setActiveChannel((prev) => prev?.id === ch.id ? prev : ch);
        }, 300);
      }
    } catch { /* ignore */ }
  }

  // Group messages for Slack-style display
  const grouped: Array<{ msg: Message; isGrouped: boolean }> = messages.map((msg, i) => ({
    msg,
    isGrouped: i > 0 && sameGroup(messages[i - 1], msg) && sameDay(messages[i - 1].createdAt, msg.createdAt),
  }));

  const channelTypeLabel: Record<string, string> = {
    PROJECT_GENERAL: 'Project channel',
    PROJECT_FEEDBACK: 'Feedback lane',
    ANNOUNCEMENT: 'Announcement',
    DIRECT: 'Direct message',
  };

  return (
    <>
    {dmModalOpen && (
      <NewDmModal
        meId={userId}
        meRole={role}
        onStart={handleStartDm}
        onClose={() => setDmModalOpen(false)}
      />
    )}
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm"
      style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(24px)' }}>

      {/* Column 1 — Channel sidebar */}
      <div className="w-56 flex-shrink-0">
        <ChannelSidebar
          channels={channels}
          activeId={activeChannel?.id ?? null}
          meId={userId}
          onSelect={(ch) => { setActiveChannel(ch); setThreadMsg(null); }}
          onNewDm={() => setDmModalOpen(true)}
        />
      </div>

      {/* Column 2 — Message feed */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Channel header */}
        {activeChannel ? (
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
            <span className="text-[15px] text-slate-400">{CHANNEL_ICON[activeChannel.type] ?? '#'}</span>
            <div>
              <p className="text-[14px] font-semibold text-slate-800">
                {activeChannel.type === 'DIRECT' ? dmDisplayName(activeChannel, userId) : `${activeProject?.title ?? activeChannel.project?.title ?? 'Project'} · ${activeChannel.name}`}
              </p>
              {activeChannel.description && activeChannel.type !== 'DIRECT' && (
                <p className="text-[11px] text-slate-400">{activeChannel.description}</p>
              )}
            </div>
            <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100">
              {channelTypeLabel[activeChannel.type] ?? 'channel'}
            </span>
            {activeProject && activeProject.milestones.length > 0 && (
              <div className="hidden xl:flex items-center gap-1.5 max-w-[45%] overflow-x-auto">
                {activeProject.milestones.slice(0, 4).map((milestone) => (
                  <span key={milestone.id} title={milestone.title}
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] ${milestone.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {milestone.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="border-b border-slate-100 px-5 py-3.5">
            <p className="text-[14px] font-semibold text-slate-400">Select a channel</p>
          </div>
        )}

        {/* Messages */}
        <div ref={feedRef} className="flex-1 overflow-y-auto py-3">
          {!activeChannel && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-slate-600">Choose a channel to start messaging</p>
              <p className="text-[12px] text-slate-400">Channels are created automatically when your project is set up.</p>
            </div>
          )}

          {activeChannel && msgLoading && (
            <div className="flex flex-col gap-3 px-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-slate-200 rounded w-24" />
                    <div className="h-2.5 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeChannel && !msgLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-8">
              <p className="text-[14px] font-semibold text-slate-500">No messages yet</p>
              <p className="text-[12px] text-slate-400">Be the first to say something in #{activeChannel.name}!</p>
            </div>
          )}

          {grouped.map(({ msg, isGrouped }, i) => {
            const prevDate = i > 0 ? messages[i - 1].createdAt : null;
            const showDateDivider = !prevDate || !sameDay(prevDate, msg.createdAt);
            return (
              <React.Fragment key={msg.id}>
                {showDateDivider && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[11px] font-semibold text-slate-400 bg-white px-2">{fmtDate(msg.createdAt)}</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                )}
                <MessageBubble
                  msg={msg}
                  isGrouped={isGrouped}
                  meId={userId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReact={handleReact}
                  onOpenThread={(m) => setThreadMsg(m)}
                />
              </React.Fragment>
            );
          })}
        </div>

        {/* Typing indicator */}
        <div className="h-5 px-5 flex items-center">
          {typingNames.length > 0 && (
            <p className="text-[11px] text-slate-400 italic">
              {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing…
            </p>
          )}
        </div>

        {/* Input */}
        {activeChannel && (
          <div className="px-4 pb-4 pt-1">
            <MessageInput
              placeholder={activeChannel.type === 'DIRECT'
                ? `Message ${dmDisplayName(activeChannel, userId)}`
                : `Message #${activeChannel.name}`}
              onSend={handleSend}
              onTyping={handleTyping}
            />
          </div>
        )}
      </div>

      {/* Column 3 — Thread panel (slides in) */}
      {threadMsg && activeChannel && (
        <div className="w-72 flex-shrink-0">
          <ThreadPanel
            parentMsg={threadMsg}
            channelId={activeChannel.id}
            meId={userId}
            onClose={() => setThreadMsg(null)}
            onSend={(content, parentId) => handleSend(content, parentId)}
          />
        </div>
      )}
    </div>
    </>
  );
}
