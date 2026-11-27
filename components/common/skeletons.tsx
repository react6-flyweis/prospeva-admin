"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "./data-table";

/*
 * Loading placeholders. Each one renders the same containers and CSS classes as the
 * real screen (Card/.panel, .metric, .rail-list, DataTable markup…) with Skeleton
 * blocks in place of content, so nothing jumps when data arrives.
 * Each top-level wrapper is a polite status region so screen readers hear the label once.
 */

function Loading({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Card + header like Panel, with a skeleton title. */
function PanelSkeleton({ titleWidth = "w-40", action, children }: { titleWidth?: string; action?: boolean; children: React.ReactNode }) {
  return (
    <Card className="panel gap-0 py-0" aria-hidden="true">
      <CardHeader className="panel-head">
        <Skeleton className={`h-4 ${titleWidth}`} />
        {action && <Skeleton className="h-4 w-20" />}
      </CardHeader>
      {children}
    </Card>
  );
}

export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`metrics ${count === 4 ? "" : "compact"}`} aria-hidden="true">
      {range(count).map((i) => (
        <Card className="metric flex-row" key={i}>
          <Skeleton className="size-[39px] shrink-0 rounded-[9px]" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ActionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="action-strip" aria-hidden="true">
      {range(count).map((i) => (
        <Skeleton key={i} className="h-9 w-36" />
      ))}
    </div>
  );
}

/** A records panel: header plus the full DataTable placeholder. */
function RecordsPanelSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <PanelSkeleton titleWidth="w-48">
      <DataTableSkeleton rows={rows} />
    </PanelSkeleton>
  );
}

export function RecordsSkeleton({ label = "Loading records…", rows }: { label?: string; rows?: number }) {
  return (
    <Loading label={label}>
      <RecordsPanelSkeleton rows={rows} />
    </Loading>
  );
}

/** Module screen: metric cards, action buttons, records panel. */
export function ModuleSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <Loading label={label}>
      <MetricsSkeleton />
      <ActionsSkeleton />
      <RecordsPanelSkeleton />
    </Loading>
  );
}

function RailListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rail-list">
      {range(rows).map((i) => (
        <div key={i} className="grid grid-cols-[35px_1fr_auto_56px] items-center gap-[9px] border-b border-[#edf1f6] py-[11px]">
          <Skeleton className="size-[33px] rounded-lg" />
          <Skeleton className="h-3.5 w-3/5" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="ml-auto h-3.5 w-10" />
        </div>
      ))}
    </div>
  );
}

function ApprovalListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="approval-list">
      {range(rows).map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 border-b border-[#edf1f6] py-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function MoneyMovementSkeleton() {
  return (
    <div className="chart" style={{ minHeight: 0 }}>
      <div className="chart-total gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid flex-1 content-center gap-[14px]">
        {range(3).map((i) => (
          <div key={i} className="grid gap-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <Loading label="Loading overview…">
      <MetricsSkeleton />
      <div className="grid-main">
        <PanelSkeleton>
          <MoneyMovementSkeleton />
        </PanelSkeleton>
        <PanelSkeleton titleWidth="w-24" action>
          <RailListSkeleton />
        </PanelSkeleton>
      </div>
      <div className="grid-main lower">
        <PanelSkeleton titleWidth="w-36" action>
          <DataTableSkeleton rows={5} />
        </PanelSkeleton>
        <PanelSkeleton titleWidth="w-28" action>
          <ApprovalListSkeleton />
        </PanelSkeleton>
      </div>
      <Skeleton className="h-[52px] w-full rounded-[11px]" aria-hidden="true" />
    </Loading>
  );
}

export function AIScreenSkeleton() {
  return (
    <Loading label="Loading ProspevaAI…">
      <div className="ai-page" aria-hidden="true">
        <div className="ai-hero">
          <div className="orb" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-5 w-28 rounded-full bg-white/20" />
            <Skeleton className="h-7 w-80 max-w-full bg-white/20" />
            <Skeleton className="h-4 w-full max-w-[740px] bg-white/20" />
          </div>
        </div>
        <div className="ai-grid">
          {range(6).map((i) => (
            <div key={i} className="flex min-h-[150px] flex-col gap-2 rounded-xl border border-border bg-white p-[18px]">
              <Skeleton className="size-6" />
              <Skeleton className="mt-3 h-4 w-3/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}

/** Label/value rows, matching `.sheet-body dl` (record sheet, View as User profile). */
export function DetailsSkeleton({ rows = 5, label = "Loading details…" }: { rows?: number; label?: string }) {
  return (
    <Loading label={label}>
      <div className="my-4" aria-hidden="true">
        {range(rows).map((i) => (
          <div key={i} className="grid grid-cols-[140px_1fr] items-center border-b border-border py-[11px]">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5" style={{ width: `${50 + ((i * 17) % 45)}%` }} />
          </div>
        ))}
      </div>
    </Loading>
  );
}

/** One AI message: avatar + muted bubble, matching ChatMessage in the AI sheet. */
export function MessageSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <Loading label={label}>
      <div className="flex gap-2" aria-hidden="true">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="flex w-[70%] flex-col gap-2 rounded-xl bg-muted px-3 py-3">
          <Skeleton className="h-3 w-full bg-white" />
          <Skeleton className="h-3 w-4/5 bg-white" />
          <Skeleton className="h-3 w-3/5 bg-white" />
        </div>
      </div>
    </Loading>
  );
}

/** One line of text, e.g. a page subtitle that comes from the API (matches `.page-head p`). */
export function TextSkeleton({ className = "h-[21px] w-72" }: { className?: string }) {
  return <Skeleton className={className} aria-hidden="true" />;
}
