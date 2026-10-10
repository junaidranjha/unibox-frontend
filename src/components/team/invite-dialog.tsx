'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { invitesApi } from '@/lib/api/endpoints';
import type { CreatedInvite, Role } from '@/types/api';

const schema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'AGENT']),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ open, onOpenChange }: Props): JSX.Element {
  const qc = useQueryClient();
  const [created, setCreated] = useState<CreatedInvite | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'AGENT' },
  });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => invitesApi.create({ email: v.email, role: v.role as Role }),
    onSuccess: (inv) => {
      setCreated(inv);
      qc.invalidateQueries({ queryKey: ['invites'] });
      toast.success('Invite created');
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setCreated(null);
          form.reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
          <DialogDescription>
            Share the link below with the person you want to invite.
          </DialogDescription>
        </DialogHeader>
        {!created ? (
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                {...form.register('role')}
              >
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                Create invite
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Invite created for <strong>{created.email}</strong>. This link expires on{' '}
              {new Date(created.expiresAt).toLocaleDateString()}.
            </p>
            <div className="flex gap-2">
              <Input readOnly value={created.acceptUrl} />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  void navigator.clipboard.writeText(created.acceptUrl);
                  toast.success('Link copied');
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
