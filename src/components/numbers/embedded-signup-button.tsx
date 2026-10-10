'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { numbersApi } from '@/lib/api/endpoints';
import { useFacebookSdk, type FbLoginResponse } from '@/lib/hooks/use-facebook-sdk';

interface Props {
  metaAppId: string;
  graphApiVersion: string;
}

interface SignupMessageData {
  type?: string;
  event?: 'FINISH' | 'CANCEL' | 'ERROR';
  data?: { phone_number_id?: string; waba_id?: string };
  version?: string;
}

/**
 * One-click "Connect WhatsApp Business" button driven by Meta's Embedded
 * Signup flow. Only renders when the backend has confirmed the feature is on
 * and the Meta App ID + Configuration ID are populated.
 */
export function EmbeddedSignupButton({ metaAppId, graphApiVersion }: Props): JSX.Element | null {
  const configId = process.env.NEXT_PUBLIC_META_CONFIGURATION_ID ?? '';
  const sdkReady = useFacebookSdk(metaAppId, graphApiVersion);
  const qc = useQueryClient();
  const [launching, setLaunching] = useState(false);
  const idsRef = useRef<{ waba?: string; phone?: string }>({});

  const connect = useMutation({
    mutationFn: numbersApi.embeddedSignup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-numbers'] });
      toast.success('WhatsApp number connected');
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error(String((err as any)?.response?.data?.message ?? 'Could not connect number'));
    },
  });

  // Meta posts { phone_number_id, waba_id } into the parent window when the
  // user finishes the Embedded Signup iframe flow.
  useEffect(() => {
    function handleMessage(evt: MessageEvent): void {
      if (!evt.origin.endsWith('facebook.com')) return;
      let payload: SignupMessageData | null = null;
      try {
        payload = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
      } catch {
        return;
      }
      if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return;

      if (payload.event === 'FINISH' && payload.data) {
        idsRef.current = {
          waba: payload.data.waba_id,
          phone: payload.data.phone_number_id,
        };
      } else if (payload.event === 'CANCEL') {
        toast.message('Signup cancelled');
      } else if (payload.event === 'ERROR') {
        toast.error('WhatsApp signup failed');
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!configId) return null;

  function launch(): void {
    if (!window.FB) return;
    setLaunching(true);
    window.FB.login(
      (response: FbLoginResponse) => {
        setLaunching(false);
        const code = response.authResponse?.code;
        const { waba, phone } = idsRef.current;
        if (!code) {
          toast.error('WhatsApp signup was not completed');
          return;
        }
        if (!waba || !phone) {
          toast.error('WhatsApp signup finished but Meta did not return WABA details');
          return;
        }
        connect.mutate({ code, wabaId: waba, phoneNumberId: phone });
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: 'whatsapp_business_app_onboarding' },
      },
    );
  }

  const disabled = !sdkReady || launching || connect.isPending;

  return (
    <Button onClick={launch} disabled={disabled} variant="default">
      {disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Connect with WhatsApp
    </Button>
  );
}
