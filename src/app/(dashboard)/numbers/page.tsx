'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, QrCode, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Topbar } from '@/components/dashboard/topbar';
import { AddNumberDialog } from '@/components/numbers/add-number-dialog';
import { AssignUsersDialog } from '@/components/numbers/assign-users-dialog';
import { ConnectUnofficialDialog } from '@/components/numbers/connect-unofficial-dialog';
import { EmbeddedSignupButton } from '@/components/numbers/embedded-signup-button';
import { Connect360DialogButton } from '@/components/numbers/connect-360dialog-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { configApi, numbersApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/stores/auth.store';
import { formatPhone } from '@/lib/utils';
import type { WhatsAppNumber } from '@/types/api';

export default function NumbersPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [assigning, setAssigning] = useState<WhatsAppNumber | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['whatsapp-numbers'], queryFn: numbersApi.list });
  const { data: config } = useQuery({ queryKey: ['public-config'], queryFn: configApi.get });
  const embeddedSignupOn = !!config?.embeddedSignup.enabled && !!config.embeddedSignup.metaAppId;
  const threeSixtyOn = !!config?.threeSixtyDialog.enabled;
  const unofficialOn = !!config?.unofficial.enabled;
  const hasOnboarding = embeddedSignupOn || threeSixtyOn || unofficialOn;
  const remove = useMutation({
    mutationFn: numbersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-numbers'] });
      toast.success('Number removed');
    },
  });

  return (
    <>
      <Topbar title="WhatsApp numbers" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Connect numbers from Meta WhatsApp Cloud API and assign them to agents.
          </p>
          {canManage && (
            <div className="flex items-center gap-2">
              {embeddedSignupOn && config && (
                <EmbeddedSignupButton
                  metaAppId={config.embeddedSignup.metaAppId}
                  graphApiVersion={config.embeddedSignup.graphApiVersion}
                />
              )}
              {threeSixtyOn && <Connect360DialogButton />}
              {unofficialOn && (
                <Button variant="outline" onClick={() => setQrOpen(true)}>
                  <QrCode className="mr-2 h-4 w-4" /> Connect via QR
                </Button>
              )}
              <Button variant={hasOnboarding ? 'outline' : 'default'} onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> {hasOnboarding ? 'Add manually' : 'Connect number'}
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Agents</th>
                <th className="px-4 py-2">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3" colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}
              {data?.map((n) => (
                <tr key={n.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {n.displayName}
                      <Badge variant="muted">
                        {n.provider === 'THREESIXTYDIALOG'
                          ? '360dialog'
                          : n.provider === 'UNOFFICIAL'
                            ? 'Unofficial'
                            : 'Meta'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatPhone(n.displayPhone)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="muted">{n.assignedUserIds.length} assigned</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {n.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Disabled</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canManage && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setAssigning(n)}>
                          <Users className="mr-1 h-3 w-3" /> Assign
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Remove ${n.displayName}?`)) remove.mutate(n.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                    No numbers connected yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddNumberDialog open={addOpen} onOpenChange={setAddOpen} />
      <ConnectUnofficialDialog open={qrOpen} onOpenChange={setQrOpen} />
      {assigning && (
        <AssignUsersDialog
          number={assigning}
          open={!!assigning}
          onOpenChange={(o) => !o && setAssigning(null)}
        />
      )}
    </>
  );
}
