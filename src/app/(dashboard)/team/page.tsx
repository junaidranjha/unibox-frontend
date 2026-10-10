'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Topbar } from '@/components/dashboard/topbar';
import { InviteDialog } from '@/components/team/invite-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { invitesApi, membersApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/stores/auth.store';
import { initials } from '@/lib/utils';
import type { Role } from '@/types/api';

export default function TeamPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';
  const [inviteOpen, setInviteOpen] = useState(false);

  const qc = useQueryClient();
  const members = useQuery({ queryKey: ['members'], queryFn: membersApi.list });
  const invites = useQuery({
    queryKey: ['invites'],
    queryFn: invitesApi.list,
    enabled: canManage,
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => membersApi.updateRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      toast.success('Role updated');
    },
  });
  const remove = useMutation({
    mutationFn: membersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member removed');
    },
  });
  const revokeInvite = useMutation({
    mutationFn: invitesApi.revoke,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invites'] });
      toast.success('Invite revoked');
    },
  });

  return (
    <>
      <Topbar title="Team" />
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Members</h2>
            {canManage && (
              <Button onClick={() => setInviteOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Invite
              </Button>
            )}
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {members.isLoading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="p-3">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))}
                {members.data?.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(m.name)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{m.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-3">
                      {canManage && m.role !== 'OWNER' && m.userId !== user?.id ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            updateRole.mutate({ id: m.id, role: e.target.value as Role })
                          }
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="AGENT">Agent</option>
                        </select>
                      ) : (
                        <Badge variant="muted">{m.role}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canManage && m.role !== 'OWNER' && m.userId !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Remove ${m.name}?`)) remove.mutate(m.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {canManage && (
          <section>
            <h2 className="mb-3 text-sm font-semibold">Pending invites</h2>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {invites.data?.filter((i) => i.status === 'PENDING').map((i) => (
                    <tr key={i.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{i.email}</td>
                      <td className="px-4 py-3">{i.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        Expires {new Date(i.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => revokeInvite.mutate(i.id)}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {invites.data && invites.data.filter((i) => i.status === 'PENDING').length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        No pending invites.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
