"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { VisibilityState } from "@tanstack/react-table";

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

type Prefs = { pageSize: number; columns: VisibilityState };

type TablePrefsState = {
  /** Per-table preferences, keyed by table id (e.g. "module:transactions"). */
  tables: Record<string, Prefs>;
  setPageSize: (id: string, pageSize: number) => void;
  setColumns: (id: string, columns: VisibilityState) => void;
  reset: (id: string) => void;
};

/** Page size and hidden columns per table, persisted. Search and sort are not persisted. */
export const useTablePrefsStore = create<TablePrefsState>()(
  persist(
    (set) => ({
      tables: {},
      setPageSize: (id, pageSize) =>
        set((s) => ({ tables: { ...s.tables, [id]: { columns: s.tables[id]?.columns ?? {}, pageSize } } })),
      setColumns: (id, columns) =>
        set((s) => ({ tables: { ...s.tables, [id]: { pageSize: s.tables[id]?.pageSize ?? DEFAULT_PAGE_SIZE, columns } } })),
      reset: (id) =>
        set((s) => {
          const tables = { ...s.tables };
          delete tables[id];
          return { tables };
        }),
    }),
    { name: "prospeva-admin-tables", storage: createJSONStorage(() => localStorage) },
  ),
);

const NO_COLUMNS: VisibilityState = {};

/** Preferences for one table, with defaults. */
export function useTablePrefs(id: string) {
  const prefs = useTablePrefsStore((s) => s.tables[id]);
  const setPageSize = useTablePrefsStore((s) => s.setPageSize);
  const setColumns = useTablePrefsStore((s) => s.setColumns);
  const reset = useTablePrefsStore((s) => s.reset);
  return {
    pageSize: prefs?.pageSize ?? DEFAULT_PAGE_SIZE,
    columns: prefs?.columns ?? NO_COLUMNS,
    setPageSize: (n: number) => setPageSize(id, n),
    setColumns: (c: VisibilityState) => setColumns(id, c),
    reset: () => reset(id),
  };
}
