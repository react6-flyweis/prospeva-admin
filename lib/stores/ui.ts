"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ControlRecord } from "@/lib/api/schemas";

export type AIRequest = { prompt?: string; capability?: string; context?: string; label?: string };

type UIState = {
  /** Sidebar groups the user collapsed (persisted). */
  collapsed: Record<string, boolean>;
  toggleGroup: (group: string) => void;

  /** Record shown in the detail sheet. */
  record: ControlRecord | null;
  openRecord: (record: ControlRecord) => void;
  closeRecord: () => void;

  /** ProspevaAI sheet. `id` changes per open so the sheet resets. */
  ai: { open: boolean; request?: AIRequest; id: number };
  openAI: (request?: AIRequest) => void;
  setAIOpen: (open: boolean) => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      collapsed: {},
      toggleGroup: (group) => set((s) => ({ collapsed: { ...s.collapsed, [group]: !s.collapsed[group] } })),

      record: null,
      openRecord: (record) => set({ record }),
      closeRecord: () => set({ record: null }),

      ai: { open: false, id: 0 },
      openAI: (request) => set((s) => ({ ai: { open: true, request, id: s.ai.id + 1 } })),
      setAIOpen: (open) => set((s) => ({ ai: { ...s.ai, open } })),
    }),
    {
      name: "prospeva-admin-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ collapsed: s.collapsed }),
    },
  ),
);
