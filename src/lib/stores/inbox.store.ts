'use client';

import { create } from 'zustand';

interface InboxState {
  selectedConversationId: string | null;
  numberFilter: string | null;
  scope: 'all' | 'mine' | 'unassigned';
  setSelected: (id: string | null) => void;
  setNumberFilter: (id: string | null) => void;
  setScope: (scope: 'all' | 'mine' | 'unassigned') => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  selectedConversationId: null,
  numberFilter: null,
  scope: 'all',
  setSelected: (id) => set({ selectedConversationId: id }),
  setNumberFilter: (id) => set({ numberFilter: id }),
  setScope: (scope) => set({ scope }),
}));
