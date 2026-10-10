'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { numbersApi } from '@/lib/api/endpoints';

/**
 * Kicks off 360dialog's Integrated Onboarding (OAuth-style). Asks the backend
 * for the hosted hub URL, then full-page redirects the customer there. On
 * completion 360dialog redirects to /numbers/360dialog/callback, which finishes
 * the connection.
 */
export function Connect360DialogButton(): JSX.Element {
  const start = useMutation({
    mutationFn: () => {
      const redirectUrl = `${window.location.origin}/numbers/360dialog/callback`;
      return numbersApi.threeSixtyOnboardingUrl(redirectUrl);
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('Could not start 360dialog onboarding'),
  });

  return (
    <Button onClick={() => start.mutate()} disabled={start.isPending}>
      {start.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Connect with 360dialog
    </Button>
  );
}
