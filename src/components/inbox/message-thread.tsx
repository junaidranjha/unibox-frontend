'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { conversationsApi, membersApi } from '@/lib/api/endpoints';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatPhone, initials } from '@/lib/utils';
import type { Message, MessageStatus } from '@/types/api';
import { Composer } from './composer';

export function MessageThread({ conversationId }: { conversationId: string }): JSX.Element {
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  const conv = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationsApi.get(conversationId),
  });

  const messages = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationsApi.listMessages(conversationId, { limit: 50 }),
  });

  const members = useQuery({ queryKey: ['members'], queryFn: membersApi.list });

  const markRead = useMutation({
    mutationFn: () => conversationsApi.markRead(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });

  const assign = useMutation({
    mutationFn: (userId: string | undefined) => conversationsApi.assign(conversationId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversation', conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Assignment updated');
    },
  });

  const resolve = useMutation({
    mutationFn: () =>
      conversationsApi.updateStatus(
        conversationId,
        conv.data?.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED',
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversation', conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    if (conv.data && conv.data.unreadCount > 0) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv.data?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.data?.length]);

  if (conv.isLoading) {
    return <Skeleton className="m-6 h-10 w-40" />;
  }
  if (!conv.data) return <div className="p-6 text-sm text-muted-foreground">Conversation not found.</div>;

  const name =
    conv.data.contact.name ?? conv.data.contact.profileName ?? formatPhone(conv.data.contact.waId);

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-xs text-muted-foreground">{formatPhone(conv.data.contact.waId)}</div>
          </div>
          {conv.data.assignment && (
            <Badge variant="muted" className="ml-2">
              Assigned to {conv.data.assignment.userName}
            </Badge>
          )}
          {conv.data.status === 'RESOLVED' && <Badge variant="success">Resolved</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border bg-background px-2 text-xs"
            value={conv.data.assignment?.userId ?? ''}
            onChange={(e) => assign.mutate(e.target.value || undefined)}
          >
            <option value="">Unassigned</option>
            {members.data?.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => resolve.mutate()}>
            {conv.data.status === 'RESOLVED' ? 'Reopen' : 'Resolve'}
          </Button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-6">
        {messages.isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-1/2" />)}
        {messages.data?.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <Composer
        conversationId={conversationId}
        disabled={conv.data.status === 'RESOLVED'}
        sending={sending}
        setSending={setSending}
      />
    </section>
  );
}

function MessageBubble({ message }: { message: Message }): JSX.Element {
  const outbound = message.direction === 'OUTBOUND';
  return (
    <div className={cn('flex', outbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm',
          outbound ? 'bg-primary text-primary-foreground' : 'bg-card',
        )}
      >
        {message.text ?? <em className="text-xs opacity-70">[{message.type.toLowerCase()}]</em>}
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-[10px]',
            outbound ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
          {outbound && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: MessageStatus }): JSX.Element {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-3 w-3" />;
    case 'SENT':
      return <Check className="h-3 w-3" />;
    case 'DELIVERED':
      return <CheckCheck className="h-3 w-3" />;
    case 'READ':
      return <CheckCheck className="h-3 w-3 text-sky-200" />;
    case 'FAILED':
      return <X className="h-3 w-3 text-destructive" />;
  }
}
