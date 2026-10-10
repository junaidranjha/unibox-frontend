'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import { conversationsApi, numbersApi } from '@/lib/api/endpoints';
import { useInboxStore } from '@/lib/stores/inbox.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn, formatPhone, initials } from '@/lib/utils';

const SCOPES = ['all', 'mine', 'unassigned'] as const;

export function ConversationList(): JSX.Element {
  const { selectedConversationId, setSelected, numberFilter, setNumberFilter, scope, setScope } =
    useInboxStore();

  const numbersQuery = useQuery({ queryKey: ['whatsapp-numbers'], queryFn: numbersApi.list });

  const conversationsQuery = useQuery({
    queryKey: ['conversations', { numberFilter, scope }],
    queryFn: () =>
      conversationsApi.list({
        whatsappNumberId: numberFilter ?? undefined,
        scope,
        limit: 50,
      }),
  });

  return (
    <aside className="flex w-80 flex-col border-r bg-card/20">
      <div className="space-y-3 border-b p-3">
        <div className="flex gap-1">
          {SCOPES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={scope === s ? 'default' : 'outline'}
              className="h-7 flex-1 capitalize"
              onClick={() => setScope(s)}
            >
              {s}
            </Button>
          ))}
        </div>
        <select
          className="h-8 w-full rounded-md border bg-background px-2 text-sm"
          value={numberFilter ?? ''}
          onChange={(e) => setNumberFilter(e.target.value || null)}
        >
          <option value="">All numbers</option>
          {numbersQuery.data?.map((n) => (
            <option key={n.id} value={n.id}>
              {n.displayName} · {formatPhone(n.displayPhone)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversationsQuery.isLoading && (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {conversationsQuery.data?.data.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</div>
        )}

        {conversationsQuery.data?.data.map((c) => {
          const name = c.contact.name ?? c.contact.profileName ?? formatPhone(c.contact.waId);
          const selected = selectedConversationId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={cn(
                'flex w-full items-start gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-accent/60',
                selected && 'bg-accent',
              )}
            >
              <Avatar>
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium">{name}</div>
                  {c.lastMessageAt && (
                    <div className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(c.lastMessageAt), { addSuffix: false })}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-xs text-muted-foreground">
                    {c.lastMessagePreview ?? 'No messages yet'}
                  </div>
                  {c.unreadCount > 0 && (
                    <Badge className="h-5 min-w-[1.25rem] justify-center px-1.5">
                      {c.unreadCount}
                    </Badge>
                  )}
                </div>
                {c.assignment && (
                  <Badge variant="muted" className="mt-1">
                    {c.assignment.userName}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
