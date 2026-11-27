"use client";

import { useCallback, useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { Panel } from "@/components/common/display";
import { RecordsSkeleton } from "@/components/common/skeletons";
import { EmptyState, ErrorState } from "@/components/common/states";
import type { ControlRecord } from "@/lib/api/schemas";
import { useModuleRecords } from "@/lib/api/queries";
import { useTablePrefs } from "@/lib/stores/table-prefs";
import { useUI } from "@/lib/stores/ui";

/** Records already in memory (e.g. overview lists): sorted, filtered and paged in the browser. */
export function RecordsTable({ id, records, title, action }: { id: string; records: ControlRecord[]; title: string; action?: React.ReactNode }) {
  const openRecord = useUI((s) => s.openRecord);
  return (
    <Panel title={title} action={action}>
      {records.length ? (
        <DataTable id={id} records={records} onOpen={openRecord} exportName={id} />
      ) : (
        <EmptyState description="No records." />
      )}
    </Panel>
  );
}

/**
 * A module's table records, paged and searched on the server (`/records?page&limit&search`).
 * Sorting is client-side within the page: the API has no sort parameter yet.
 * Rows of other kinds (toggle/policy cards) are left out; see ModuleScreen.
 */
export function ModuleRecords({ module, title, emptyText = "No records yet." }: { module: string; title: string; emptyText?: string }) {
  const id = `module:${module}`;
  const { pageSize } = useTablePrefs(id);
  const openRecord = useUI((s) => s.openRecord);
  const [query, setQuery] = useState({ page: 0, search: "" });
  const res = useModuleRecords(module, { page: query.page + 1, limit: pageSize, search: query.search || undefined });

  const onSearchChange = useCallback((search: string) => setQuery((q) => (q.search === search ? q : { page: 0, search })), []);
  const onPageChange = useCallback((page: number) => setQuery((q) => ({ ...q, page })), []);

  if (res.error && !res.data) return <ErrorState message={res.error.message} onRetry={() => res.refetch()} />;
  if (!res.data) return <RecordsSkeleton label={`Loading ${title.toLowerCase()}…`} />;

  const docs = res.data.docs.filter((r) => r.kind === "table");
  // A module with no table rows at all (unfiltered) shows a plain empty panel instead of a table.
  if (!docs.length && !query.search && query.page === 0 && !res.isPlaceholderData)
    return (
      <Panel title={title}>
        <EmptyState description={emptyText} />
      </Panel>
    );

  return (
    <Panel
      title={title}
      action={res.error ? <small className="form-error m-0">Could not refresh: {res.error.message}</small> : undefined}
    >
      <DataTable
        id={id}
        records={docs}
        onOpen={openRecord}
        exportName={`${module}-selected`}
        server={{
          pageIndex: query.page,
          pageCount: res.data.totalPages,
          total: res.data.totalDocs,
          onPageChange,
          search: query.search,
          onSearchChange,
          fetching: res.isPlaceholderData && res.isFetching,
        }}
      />
    </Panel>
  );
}
