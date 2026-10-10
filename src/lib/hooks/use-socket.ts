'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { tokenStore } from '@/lib/api/tokens';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { Conversation, Message } from '@/types/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

type MessagePayload = { conversationId: string; message: Message };

export function useSocket(): Socket | null {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    const token = tokenStore.get()?.accessToken;
    if (!token) return;

    const socket = io(WS_URL, { auth: { token }, transports: ['websocket'] });
    ref.current = socket;

    socket.on('message.created', ({ conversationId, message }: MessagePayload) => {
      qc.setQueryData<Message[]>(['messages', conversationId], (prev) =>
        prev ? [...prev.filter((m) => m.id !== message.id), message] : [message],
      );
      qc.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on('message.updated', ({ conversationId, message }: MessagePayload) => {
      qc.setQueryData<Message[]>(['messages', conversationId], (prev) =>
        prev ? prev.map((m) => (m.id === message.id ? message : m)) : [message],
      );
    });

    socket.on('conversation.created', () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on('conversation.updated', (conv: Conversation) => {
      qc.setQueryData(['conversation', conv.id], conv);
      qc.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      socket.disconnect();
      ref.current = null;
    };
  }, [user, qc]);

  return ref.current;
}
