"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminUser } from "@/lib/api/schemas";

type AuthState = {
  token: string | null;
  user: AdminUser | null;
  signIn: (token: string, user: AdminUser) => void;
  signOut: () => void;
};

/** Access token + signed-in admin, persisted to localStorage. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: (token, user) => set({ token, user }),
      signOut: () => set({ token: null, user: null }),
    }),
    { name: "prospeva-admin-auth", storage: createJSONStorage(() => localStorage) },
  ),
);
