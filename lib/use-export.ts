"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { downloadCSV } from "./csv";

type ExportData = { headers: string[]; rows: string[][] };

const MIN_PENDING_MS = 1000;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * CSV export as a mutation: `isPending` stays true for at least one second so the
 * button can show progress, then the file downloads and a success toast appears.
 * `load` may fetch the rows (e.g. all pages from the API).
 */
export function useExport(name: string) {
  return useMutation({
    mutationFn: async (load: () => ExportData | Promise<ExportData>) => {
      const [data] = await Promise.all([load(), wait(MIN_PENDING_MS)]);
      downloadCSV(name, data.headers, data.rows);
      return data.rows.length;
    },
    onSuccess: (count) => toast.success(`Exported ${count} record${count === 1 ? "" : "s"}`),
    onError: (e: Error) => toast.error(e.message || "Export failed"),
  });
}
