'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { numbersApi } from '@/lib/api/endpoints';

/**
 * Landing page 360dialog redirects to after Integrated Onboarding.
 * Reads ?client=<id>&channels=["<channelId>"] and finishes the connection.
 */
export default function ThreeSixtyCallbackPage(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const done = useRef(false);

  const connect = useMutation({
    mutationFn: (channelId: string) => numbersApi.threeSixtyConnect(channelId),
    onSuccess: () => {
      toast.success('WhatsApp number connected via 360dialog');
      router.replace('/numbers');
    },
    onError: () => {
      toast.error('Could not finish 360dialog connection');
      router.replace('/numbers');
    },
  });

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const channelsRaw = params.get('channels');
    const revoked = params.get('revoked');
    if (revoked) {
      toast.message('360dialog access was revoked');
      router.replace('/numbers');
      return;
    }

    let channelId: string | null = null;
    if (channelsRaw) {
      try {
        const parsed = JSON.parse(channelsRaw) as string[];
        channelId = parsed[0] ?? null;
      } catch {
        channelId = channelsRaw; // sometimes passed as a bare id
      }
    }

    if (!channelId) {
      toast.error('360dialog did not return a channel');
      router.replace('/numbers');
      return;
    }
    connect.mutate(channelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Finishing WhatsApp connection…
      </div>
    </div>
  );
}
