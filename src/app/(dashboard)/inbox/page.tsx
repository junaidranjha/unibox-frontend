'use client';

import { MessageSquare } from 'lucide-react';
import { ConversationList } from '@/components/inbox/conversation-list';
import { MessageThread } from '@/components/inbox/message-thread';
import { Topbar } from '@/components/dashboard/topbar';
import { useInboxStore } from '@/lib/stores/inbox.store';

export default function InboxPage(): JSX.Element {
  const selectedId = useInboxStore((s) => s.selectedConversationId);

  return (
    <>
      <Topbar title="Inbox" />
      <div className="flex min-h-0 flex-1">
        <ConversationList />
        {selectedId ? (
          <MessageThread conversationId={selectedId} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-2 h-10 w-10 opacity-50" />
              <div className="text-sm">Select a conversation to start</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
