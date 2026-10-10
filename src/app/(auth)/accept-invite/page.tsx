'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/stores/auth.store';

const schema = z.object({
  name: z.string().min(1),
  password: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

export default function AcceptInvitePage(): JSX.Element {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const setSession = useAuthStore((s) => s.setSession);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => authApi.acceptInvite({ ...v, token }),
    onSuccess: (data) => {
      setSession(data.user, data.tokens);
      toast.success(`Welcome to ${data.user.organizationName}`);
      router.replace('/inbox');
    },
    onError: () => toast.error('Invite could not be accepted'),
  });

  if (!token) return <p className="text-center text-sm text-destructive">Missing invite token.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join your team</CardTitle>
        <CardDescription>Set a password to accept the invite</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" {...form.register('name')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register('password')} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Accept invite
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
