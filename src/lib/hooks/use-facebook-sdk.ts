'use client';

import { useEffect, useState } from 'react';

/**
 * Loads Meta's Facebook JS SDK on demand. Resolves to `true` once FB is on
 * window and initialized. Only call this inside a component that will mount
 * when Embedded Signup is actually offered — the SDK is ~70KB.
 */
export function useFacebookSdk(appId: string | null, apiVersion = 'v20.0'): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!appId || typeof window === 'undefined') return;
    if (window.FB) {
      setReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: false,
        version: apiVersion,
      });
      setReady(true);
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
  }, [appId, apiVersion]);

  return ready;
}

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
      login: (
        cb: (response: FbLoginResponse) => void,
        options: {
          config_id: string;
          response_type: 'code';
          override_default_response_type: boolean;
          extras?: Record<string, unknown>;
        },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export interface FbLoginResponse {
  authResponse?: {
    code: string;
    userID?: string;
  } | null;
  status: 'connected' | 'not_authorized' | 'unknown';
}
