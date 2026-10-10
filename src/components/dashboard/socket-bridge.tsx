'use client';

import { useSocket } from '@/lib/hooks/use-socket';

export function SocketBridge(): null {
  useSocket();
  return null;
}
