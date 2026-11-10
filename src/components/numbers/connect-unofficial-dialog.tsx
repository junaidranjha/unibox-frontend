'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Unofficial (self-hosted gateway) connect flow. No Meta credentials: create a number, then link it
 * by scanning the QR shown here in WhatsApp → Linked Devices. Polls the backend until the session
 * reaches `ready`.
 */
export function ConnectUnofficialDialog({ open, onOpenChange }: Props): JSX.Element {
  const qc = useQueryClient();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [numberId, setNumberId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  const reset = (): void => {
    setNumberId(null);
    setPairingCode(null);
    form.reset();
  };

  const connect = useMutation({
    mutationFn: numbersApi.connectUnofficial,
    onSuccess: (number) => {
      setNumberId(number.id);
      qc.invalidateQueries({ queryKey: ['whatsapp-numbers'] });
    },
    onError: (err: unknown) => {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        String((err as any)?.response?.data?.message ?? 'Could not start connection');
      toast.error(message);
    },
  });

  // Poll link status while a session exists and is not yet connected.
  const { data: status } = useQuery({
    queryKey: ['unofficial-connection', numberId],
    queryFn: () => numbersApi.connectionStatus(numberId as string),
    enabled: open && !!numberId,
    refetchInterval: (query) => (query.state.data?.connected ? false : 2500),
  });

  useEffect(() => {
    if (status?.connected) {
      toast.success('WhatsApp number connected');
      qc.invalidateQueries({ queryKey: ['whatsapp-numbers'] });
      reset();
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.connected]);

  const pairing = useMutation({
    mutationFn: () =>
      numbersApi.requestPairingCode(numberId as string, form.getValues('displayPhone').replace(/\D/g, '')),
    onSuccess: (res) => setPairingCode(res.pairingCode),
    onError: () => toast.error('Could not get a pairing code'),
  });

  const handleOpenChange = (next: boolean): void => {
    if (!next) reset();
    onOpenChange(next);
  };

  const linking = !!numberId;
  const statusLabel = status?.status ?? 'starting';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect via QR code</DialogTitle>
          <DialogDescription>
            No Meta account needed — link a number by scanning a QR in WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {!linking ? (
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit((v) => connect.mutate(v))}
          >
            <div className="space-y-1">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" placeholder="e.g. Personal" {...form.register('displayName')} />
              {form.formState.errors.displayName && (
                <p className="text-xs text-destructive">Required</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="displayPhone">Phone (E.164)</Label>
              <Input id="displayPhone" placeholder="+14155550123" {...form.register('displayPhone')} />
              {form.formState.errors.displayPhone && (
                <p className="text-xs text-destructive">Required</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={connect.isPending}>
                {connect.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              {status?.qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={status.qrCode}
                  alt="WhatsApp QR code"
                  className="h-56 w-56 rounded-md border bg-white p-2"
                />
              ) : (
                <div className="flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-md border text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-xs capitalize">{statusLabel.replace(/_/g, ' ')}…</span>
                </div>
              )}
              <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
                <li>Open WhatsApp on the phone for this number.</li>
                <li>Go to Settings → Linked Devices → Link a device.</li>
                <li>Scan this code. It refreshes automatically.</li>
              </ol>
            </div>

            {pairingCode ? (
              <p className="text-center text-sm">
                Pairing code: <span className="font-mono font-semibold tracking-widest">{pairingCode}</span>
              </p>
            ) : (
              <div className="text-center">
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  onClick={() => pairing.mutate()}
                  disabled={pairing.isPending}
                >
                  Can&apos;t scan? Use a pairing code instead
                </button>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
