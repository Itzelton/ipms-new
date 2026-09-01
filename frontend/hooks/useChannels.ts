"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet, apiPatch, apiPost, apiDelete } from '../services/api';

export type ChannelMember = { userId: string; role: string; user: { id: string; firstName?: string; lastName?: string; email: string } };
export type Channel = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  projectId?: string;
  project?: { id: string; title: string } | null;
  unread: number;
  members?: ChannelMember[];
};

export type Reaction = { emoji: string; userId: string; user: { id: string; firstName?: string; lastName?: string } };
export type Message = {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  author: { id: string; firstName?: string; lastName?: string; email: string };
  reactions: Reaction[];
  attachments: any[];
  replies: Message[];
};

export function useChannels(userId: string | null) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await apiGet('/channels');
      if (Array.isArray(list)) setChannels(list);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  function bumpUnread(channelId: string, delta = 1) {
    setChannels((prev) => prev.map((c) => c.id === channelId ? { ...c, unread: c.unread + delta } : c));
  }

  function clearUnread(channelId: string) {
    setChannels((prev) => prev.map((c) => c.id === channelId ? { ...c, unread: 0 } : c));
  }

  return { channels, loading, reload, bumpUnread, clearUnread };
}

export function useMessages(channelId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const seenIds = useRef(new Set<string>());

  const load = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const msgs = await apiGet(`/channels/${channelId}/messages`);
      if (Array.isArray(msgs)) {
        seenIds.current = new Set(msgs.map((m: Message) => m.id));
        setMessages(msgs);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [channelId]);

  useEffect(() => {
    setMessages([]);
    seenIds.current.clear();
    load();
  }, [load]);

  function appendMessage(msg: Message) {
    if (seenIds.current.has(msg.id)) return;
    seenIds.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  }

  function updateMessage(updated: Message) {
    setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m));
  }

  function removeMessage(messageId: string) {
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, deletedAt: new Date().toISOString(), content: '' } : m));
  }

  function updateReactions(messageId: string, reactions: Reaction[]) {
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, reactions } : m));
  }

  async function sendRest(channelId: string, content: string, parentId?: string) {
    const msg = await apiPost(`/channels/${channelId}/messages`, { content, parentId });
    appendMessage(msg);
    return msg;
  }

  async function editRest(channelId: string, messageId: string, content: string) {
    const msg = await apiPatch(`/channels/${channelId}/messages/${messageId}`, { content });
    updateMessage(msg);
    return msg;
  }

  async function deleteRest(channelId: string, messageId: string) {
    await apiDelete(`/channels/${channelId}/messages/${messageId}`);
    removeMessage(messageId);
  }

  async function reactRest(channelId: string, messageId: string, emoji: string) {
    const reactions = await apiPost(`/channels/${channelId}/messages/${messageId}/reactions`, { emoji });
    if (Array.isArray(reactions)) updateReactions(messageId, reactions);
  }

  return { messages, loading, appendMessage, updateMessage, removeMessage, updateReactions, sendRest, editRest, deleteRest, reactRest };
}

export function useThreadReplies(parentId: string | null) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parentId) { setReplies([]); return; }
    setLoading(true);
    // find channel from parent — fetched by caller via message.channelId
  }, [parentId]);

  async function loadReplies(channelId: string, pId: string) {
    setLoading(true);
    try {
      const data = await apiGet(`/channels/${channelId}/messages/${pId}/thread`);
      if (Array.isArray(data)) setReplies(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function appendReply(msg: Message) {
    setReplies((prev) => {
      if (prev.some((r) => r.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }

  return { replies, loading, loadReplies, appendReply, setReplies };
}
