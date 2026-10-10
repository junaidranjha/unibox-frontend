import { AuthGate } from '@/components/dashboard/auth-gate';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SocketBridge } from '@/components/dashboard/socket-bridge';

export default function DashboardLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <AuthGate>
      <SocketBridge />
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </AuthGate>
  );
}
