"use client";

import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Columns3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ControlRecord } from "@/lib/api/schemas";
import { recordFields, recordsToRows } from "@/lib/records";
import { PAGE_SIZES, useTablePrefs } from "@/lib/stores/table-prefs";
import { useExport } from "@/lib/use-export";
import { EmptyState } from "./states";

/** Server-side paging and search. Omit for client-side (all rows already loaded). Sorting is always client-side. */
export type ServerPaging = {
  /** 0-based page index. */
  pageIndex: number;
  pageCount: number;
  total: number;
  onPageChange: (pageIndex: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  /** A new page or search is loading: rows show as skeletons. */
  fetching: boolean;
};

type Props = {
  /** Persistence key for page size and hidden columns. */
  id: string;
  records: ControlRecord[];
  onOpen: (record: ControlRecord) => void;
  exportName: string;
  server?: ServerPaging;
};

const selectColumn: ColumnDef<ControlRecord> = {
  id: "select",
  enableSorting: false,
  enableHiding: false,
  header: ({ table }) => (
    <Checkbox
      aria-label="Select visible records"
      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
    />
  ),
  cell: ({ row }) => (
    <Checkbox aria-label={`Select ${row.original.reference}`} checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
  ),
};

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function DataTable({ id, records, onOpen, exportName, server }: Props) {
  const prefs = useTablePrefs(id);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState(server?.search ?? "");
  const [clientPage, setClientPage] = useState(0);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  // Selected records by id, kept across server pages so "Export selected" can include them.
  const [picked, setPicked] = useState<Record<string, ControlRecord>>({});
  const exporter = useExport(exportName);

  // Server mode: send the search after typing stops.
  const debounced = useDebounced(search, 350);
  const onSearchChange = server?.onSearchChange;
  useEffect(() => {
    onSearchChange?.(debounced);
  }, [debounced, onSearchChange]);

  const columns = useMemo<ColumnDef<ControlRecord>[]>(
    () => [
      selectColumn,
      ...recordFields(records).map<ColumnDef<ControlRecord>>((f) => ({
        id: f.id,
        header: f.header,
        accessorFn: f.value,
        sortingFn: "alphanumeric",
      })),
      {
        id: "details",
        header: "Details",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button variant="outline" onClick={() => onOpen(row.original)} aria-label={`Open ${row.original.reference}`}>
            Open
          </Button>
        ),
      },
    ],
    [records, onOpen],
  );

  const pagination: PaginationState = { pageIndex: server ? server.pageIndex : clientPage, pageSize: prefs.pageSize };

  // TanStack Table returns a mutable instance, so the React Compiler skips this component (expected).
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: records,
    columns,
    getRowId: (r) => r._id,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility: prefs.columns,
      globalFilter: server ? undefined : search,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: (u) => prefs.setColumns(typeof u === "function" ? u(prefs.columns) : u),
    onPaginationChange: (u) => {
      const next = typeof u === "function" ? u(pagination) : u;
      if (next.pageSize !== pagination.pageSize) prefs.setPageSize(next.pageSize);
      if (server) server.onPageChange(next.pageSize !== pagination.pageSize ? 0 : next.pageIndex);
      else setClientPage(next.pageSize !== pagination.pageSize ? 0 : next.pageIndex);
    },
    onRowSelectionChange: (u) => {
      const next = typeof u === "function" ? u(rowSelection) : u;
      setRowSelection(next);
      setPicked((prev) => {
        const out: Record<string, ControlRecord> = {};
        for (const key of Object.keys(next)) {
          const r = prev[key] ?? records.find((x) => x._id === key);
          if (next[key] && r) out[key] = r;
        }
        return out;
      });
    },
    onGlobalFilterChange: () => setClientPage(0),
    enableRowSelection: true,
    autoResetPageIndex: false,
    manualPagination: !!server,
    manualFiltering: !!server,
    pageCount: server?.pageCount,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: server ? undefined : getFilteredRowModel(),
    getPaginationRowModel: server ? undefined : getPaginationRowModel(),
  });

  const selected = Object.values(picked);
  const total = server ? server.total : table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(1, table.getPageCount());
  const page = Math.min(pagination.pageIndex, pageCount - 1);
  const rows = table.getRowModel().rows;
  const visibleCount = table.getVisibleLeafColumns().length;
  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide());
  const visibleHideable = hideable.filter((c) => c.getIsVisible()).length;

  const reset = () => {
    prefs.reset();
    setSorting([]);
    setSearch("");
    setRowSelection({});
    setPicked({});
    if (server) server.onPageChange(0);
    else setClientPage(0);
  };

  return (
    <div className="enterprise-table">
      <div className="table-tools">
        <label>
          Search records
          <InputGroup>
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={search}
              placeholder="Search this table"
              onChange={(e) => {
                setSearch(e.target.value);
                if (!server) setClientPage(0);
              }}
            />
            {server?.fetching && search && (
              <InputGroupAddon align="inline-end">
                <Spinner aria-label="Searching" />
              </InputGroupAddon>
            )}
          </InputGroup>
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Columns3 /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hideable.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={c.getIsVisible()}
                // Keep at least one data column visible.
                disabled={c.getIsVisible() && visibleHideable === 1}
                onCheckedChange={(v) => c.toggleVisibility(!!v)}
                onSelect={(e) => e.preventDefault()}
              >
                {String(c.columnDef.header)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          disabled={!selected.length || exporter.isPending}
          onClick={() => exporter.mutate(() => recordsToRows(selected))}
        >
          {exporter.isPending && <Spinner />}
          {exporter.isPending ? "Exporting…" : `Export selected (${selected.length})`}
        </Button>
        <Button variant="outline" onClick={reset}>
          Reset table
        </Button>
      </div>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Scrollable records table" aria-busy={server?.fetching || undefined}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((g) => (
              <TableRow key={g.id}>
                {g.headers.map((h) => {
                  const sorted = h.column.getIsSorted();
                  return (
                    <TableHead
                      key={h.id}
                      aria-sort={h.column.getCanSort() ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
                    >
                      {h.column.getCanSort() ? (
                        <button type="button" onClick={h.column.getToggleSortingHandler()}>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sorted === "asc" && <ArrowUp className="size-3.5" aria-hidden="true" />}
                          {sorted === "desc" && <ArrowDown className="size-3.5" aria-hidden="true" />}
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {server?.fetching ? (
              <SkeletonRows rows={Math.min(prefs.pageSize, 10)} columns={visibleCount} />
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleCount}>
                  <EmptyState title="No matching records" description="Try a different search or reset the table filters." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        summary={`${total} records · Page ${page + 1} of ${pageCount}`}
        pageSize={prefs.pageSize}
        onPageSize={(n) => table.setPageSize(n)}
        canPrev={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
        onPrev={() => table.previousPage()}
        onNext={() => table.nextPage()}
      />
    </div>
  );
}

function Pagination({
  summary,
  pageSize,
  onPageSize,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  summary: React.ReactNode;
  pageSize: number;
  onPageSize: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="table-pagination">
      <span role="status">{summary}</span>
      <label>
        Rows per page
        <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
          <SelectTrigger className="w-20" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <Button variant="outline" disabled={!canPrev} onClick={onPrev}>
        Previous
      </Button>
      <Button variant="outline" disabled={!canNext} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}

const widths = (r: number, c: number) => `${55 + ((r * 7 + c * 13) % 40)}%`;

function SkeletonRows({ rows, columns }: { rows: number; columns: number }) {
  return Array.from({ length: rows }, (_, r) => (
    <TableRow key={r} aria-hidden="true">
      {Array.from({ length: columns }, (_, c) => (
        <TableCell key={c}>
          {c === 0 ? (
            <Skeleton className="size-4 rounded-[4px]" />
          ) : c === columns - 1 ? (
            <Skeleton className="h-9 w-[62px]" />
          ) : (
            <Skeleton className="h-4" style={{ width: widths(r, c) }} />
          )}
        </TableCell>
      ))}
    </TableRow>
  ));
}

/** The whole table (toolbar, header, rows, pagination) as a placeholder, matching DataTable's markup. */
export function DataTableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  const total = columns + 2; // select + data columns + details
  return (
    <div className="enterprise-table" aria-hidden="true">
      <div className="table-tools">
        <label>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-[38px] w-full" />
        </label>
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="table-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: total }, (_, c) => (
                <TableHead key={c}>
                  {c === 0 ? <Skeleton className="size-4 rounded-[4px]" /> : <Skeleton className="h-4 w-20" />}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <SkeletonRows rows={rows} columns={total} />
          </TableBody>
        </Table>
      </div>
      <div className="table-pagination">
        <Skeleton className="mr-auto h-4 w-40" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
}
