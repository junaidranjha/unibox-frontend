'use client';

import { create } from 'zustand';
import type { AuthTokens, SessionUser } from '@/types/api';
import { tokenStore } from '@/lib/api/tokens';

interface AuthState {
  user: SessionUser | null;
  hydrated: boolean;
  setSession: (user: SessionUser, tokens: AuthTokens) => void;
  clear: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setSession: (user, tokens) => {
    tokenStore.set(tokens);
    tokenStore.setUser(user);
    set({ user, hydrated: true });
  },
  clear: () => {
    tokenStore.clear();
    set({ user: null, hydrated: true });
  },
  hydrate: () => {
    const user = tokenStore.getUser();
    set({ user, hydrated: true });
  },
}));
