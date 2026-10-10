'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { membersApi, numbersApi } from '@/lib/api/endpoints';
import type { WhatsAppNumber } from '@/types/api';

interface Props {
  number: WhatsAppNumber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignUsersDialog({ number, open, onOpenChange }: Props): JSX.Element {
  const qc = useQueryClient();
  const members = useQuery({ queryKey: ['members'], queryFn: membersApi.list, enabled: open });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setSelected(new Set(number.assignedUserIds));
  }, [open, number.assignedUserIds]);

  const save = useMutation({
    mutationFn: () => numbersApi.assignUsers(number.id, Array.from(selected)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-numbers'] });
      toast.success('Assignments saved');
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign agents to {number.displayName}</DialogTitle>
          <DialogDescription>
            Choose who can see conversations on this number. Owners and admins always have access.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {members.data?.map((m) => (
            <label
              key={m.userId}
              className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
            >
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selected.has(m.userId)}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(m.userId);
                  else next.delete(m.userId);
                  setSelected(next);
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{m.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {m.email} · {m.role}
                </div>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
