'use client';

import { Topbar } from '@/components/dashboard/topbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function SettingsPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  return (
    <>
      <Topbar title="Settings" />
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>These are the details for your organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{user?.organizationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your role</span>
              <span>{user?.role}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
