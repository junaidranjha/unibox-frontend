'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Paperclip, Send } from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { conversationsApi } from '@/lib/api/endpoints';

interface Props {
  conversationId: string;
  disabled?: boolean;
  sending: boolean;
  setSending: Dispatch<SetStateAction<boolean>>;
}

export function Composer({ conversationId, disabled, sending, setSending }: Props): JSX.Element {
  const [text, setText] = useState('');
  const qc = useQueryClient();

  const send = useMutation({
    mutationFn: () => conversationsApi.send(conversationId, text.trim()),
    onMutate: () => setSending(true),
    onSettled: () => setSending(false),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message ?? 'Could not send';
      toast.error(String(msg));
    },
  });

  function submit(e: React.FormEvent): void {
    e.preventDefault();
    if (!text.trim() || sending) return;
    send.mutate();
  }

  return (
    <form className="flex items-end gap-2 border-t bg-background p-3" onSubmit={submit}>
      <Button type="button" variant="ghost" size="icon" disabled title="Attachments coming soon">
        <Paperclip className="h-4 w-4" />
      </Button>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit(e);
          }
        }}
        disabled={disabled || sending}
        placeholder={disabled ? 'Conversation is resolved' : 'Type a message… (Enter to send)'}
        rows={1}
        className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      />
      <Button type="submit" size="icon" disabled={disabled || sending || !text.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
