'use client';

import { Inbox, LogOut, MessageSquare, Phone, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, initials } from '@/lib/utils';

const nav = [
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/numbers', label: 'Numbers', icon: Phone },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

export function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuthStore();

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clear();
    toast.success('Signed out');
    router.replace('/login');
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card/40">
      <div className="flex items-center gap-2 px-4 py-4">
        <MessageSquare className="h-6 w-6 text-primary" />
        <div>
          <div className="text-sm font-semibold">Unibox</div>
          <div className="text-xs text-muted-foreground">{user?.organizationName}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t p-3">
        <div className="mb-2 flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials(user?.name ?? '?')}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.role}</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
