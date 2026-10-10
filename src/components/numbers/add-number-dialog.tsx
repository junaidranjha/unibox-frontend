'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { numbersApi } from '@/lib/api/endpoints';

const schema = z.object({
  displayName: z.string().min(1),
  displayPhone: z.string().min(5),
  phoneNumberId: z.string().min(1),
  wabaId: z.string().min(1),
  accessToken: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNumberDialog({ open, onOpenChange }: Props): JSX.Element {
  const qc = useQueryClient();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: numbersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-numbers'] });
      toast.success('Number connected');
      form.reset();
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error(String((err as any)?.response?.data?.message ?? 'Could not add number'));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect a WhatsApp number</DialogTitle>
          <DialogDescription>
            Grab these from your Meta WhatsApp Business Platform dashboard.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
          {[
            ['displayName', 'Display name', 'e.g. Sales'],
            ['displayPhone', 'Phone (E.164)', '+14155550123'],
            ['phoneNumberId', 'Meta phone_number_id', '1234567890'],
            ['wabaId', 'WABA ID', '0987654321'],
            ['accessToken', 'Access token', 'EAAG…'],
          ].map(([name, label, placeholder]) => (
            <div key={name} className="space-y-1">
              <Label htmlFor={name}>{label}</Label>
              <Input
                id={name}
                placeholder={placeholder}
                {...form.register(name as keyof FormValues)}
              />
              {form.formState.errors[name as keyof FormValues] && (
                <p className="text-xs text-destructive">Required</p>
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
