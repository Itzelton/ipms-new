"use client";
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { supabase } from '../lib/supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

export type SocketStatus = 'connecting' | 'connected' | 'disconnected';

export function useSocket(userId: string | null, channelIds: string[]) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('disconnected');

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function connect() {
      // Prefer local JWT (local-auth users); fall back to Supabase session
      let token = typeof window !== 'undefined' ? (localStorage.getItem('ipms_local_token') ?? '') : '';
      if (!token) {
        try {
          const { data } = await supabase.auth.getSession();
          token = data.session?.access_token ?? '';
        } catch { /* ignore */ }
      }

      if (cancelled) return;

      const socket = io(`${API_BASE}/channels`, {
        transports: ['websocket'],
        auth: { userId, channelIds, token },
      });

      socketRef.current = socket;
      setStatus('connecting');

      socket.on('connect', () => setStatus('connected'));
      socket.on('disconnect', () => setStatus('disconnected'));
    }

    connect().catch(() => {});

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setStatus('disconnected');
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Join a new channel dynamically
  function joinChannel(channelId: string) {
    socketRef.current?.emit('channel:join', { channelId });
  }

  function sendMessage(channelId: string, content: string, parentId?: string) {
    socketRef.current?.emit('message:send', { channelId, content, parentId });
  }

  function sendTyping(channelId: string, userName: string) {
    socketRef.current?.emit('message:typing', { channelId, userName });
  }

  function sendReaction(channelId: string, messageId: string, emoji: string) {
    socketRef.current?.emit('message:react', { channelId, messageId, emoji });
  }

  function markRead(channelId: string) {
    socketRef.current?.emit('message:read', { channelId });
  }

  function on(event: string, handler: (...args: any[]) => void) {
    socketRef.current?.on(event, handler);
    return () => { socketRef.current?.off(event, handler); };
  }

  function off(event: string, handler: (...args: any[]) => void) {
    socketRef.current?.off(event, handler);
  }

  return { status, joinChannel, sendMessage, sendTyping, sendReaction, markRead, on, off, socket: socketRef };
}
