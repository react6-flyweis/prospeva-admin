"use client";

import { AlertTriangle, ChevronRight, Network, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { MetricGrid, Panel, Status } from "@/components/common/display";
import { OverviewSkeleton } from "@/components/common/skeletons";
import { EmptyState, ErrorState } from "@/components/common/states";
import type { ControlRecord } from "@/lib/api/schemas";
import { useOverview } from "@/lib/api/queries";
import { useGo } from "@/lib/navigation";
import { useUI } from "@/lib/stores/ui";
import { RecordsTable } from "./module/records-table";

export function OverviewScreen() {
  const go = useGo();
  const openAI = useUI((s) => s.openAI);
  const res = useOverview();
  if (res.error) return <ErrorState message={res.error.message} onRetry={() => res.refetch()} />;
  if (!res.data) return <OverviewSkeleton />;
  const o = res.data;
  return (
    <>
      <MetricGrid metrics={o.metrics} compact={false} />
      {o.alertBanner && (
        <Alert role="note" className="attention">
          <div className="attention-icon" aria-hidden="true">
            <AlertTriangle />
          </div>
          <div>
            <AlertTitle className="line-clamp-none text-sm font-bold">{o.alertBanner.title}</AlertTitle>
            <AlertDescription className="block">
              <p>{o.alertBanner.subtitle}</p>
            </AlertDescription>
          </div>
          <Button onClick={() => go("reconciliation")}>{o.alertBanner.actionLabel || "Review"}</Button>
        </Alert>
      )}
      <div className="grid-main">
        {o.moneyMovement && (
          <Panel title="Money movement">
            <div className="chart" style={{ minHeight: 0 }}>
              <div className="chart-total">
                <span>Processed value</span>
                <strong>{o.moneyMovement.processedValue}</strong>
                <em>{o.moneyMovement.change}</em>
              </div>
              <div style={{ flex: 1, display: "grid", gap: 14, alignContent: "center" }}>
                {o.moneyMovement.breakdown.map((b) => (
                  <div key={b.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span>{b.label}</span>
                      <b>{b.pct}%</b>
                    </div>
                    <Progress value={b.pct} />
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}
        <Panel
          title="Rail health"
          action={
            <Button variant="link" className="text-action h-auto p-0" onClick={() => go("rails")}>
              View routing <ChevronRight />
            </Button>
          }
        >
          <div className="rail-list">
            {o.railHealth.map((r) => (
              <Item key={r.name} asChild className="rounded-none">
                <button onClick={() => go("rails")}>
                  <ItemMedia className="rail-logo" aria-hidden="true">
                    <Network size={18} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <b>{r.name}</b>
                    </ItemTitle>
                  </ItemContent>
                  <Status value={r.status} />
                  <strong>{r.uptime}</strong>
                </button>
              </Item>
            ))}
          </div>
        </Panel>
      </div>
      <div className="grid-main lower">
        <RecordsTable
          id="overview:latestTransactions"
          records={o.latestTransactions}
          title="Latest transactions"
          action={
            <Button variant="link" className="text-action h-auto p-0" onClick={() => go("transactions")}>
              View all <ChevronRight />
            </Button>
          }
        />
        <Panel
          title="Approval queue"
          action={
            <Button variant="link" className="text-action h-auto p-0" onClick={() => go("approvals")}>
              Open queue <ChevronRight />
            </Button>
          }
        >
          <ApprovalList records={o.approvalQueue.filter((r) => r.kind === "table").slice(0, 4)} />
        </Panel>
      </div>
      {o.reconciliationBreaks.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <RecordsTable
            id="overview:reconciliationBreaks"
            records={o.reconciliationBreaks}
            title="Reconciliation breaks"
            action={
              <Button variant="link" className="text-action h-auto p-0" onClick={() => go("reconciliation")}>
                Open reconciliation <ChevronRight />
              </Button>
            }
          />
        </div>
      )}
      {o.prospevaAIInsight && (
        <div className="insight">
          <div>
            <Sparkles />
            <span>ProspevaAI insight</span>
          </div>
          <p>
            <b>{o.prospevaAIInsight.title}.</b> {o.prospevaAIInsight.subtitle}
          </p>
          <Button variant="link" onClick={() => openAI({ prompt: o.prospevaAIInsight!.title, label: o.prospevaAIInsight!.title })}>
            Investigate <ChevronRight />
          </Button>
        </div>
      )}
    </>
  );
}

function ApprovalList({ records }: { records: ControlRecord[] }) {
  const openRecord = useUI((s) => s.openRecord);
  if (!records.length) return <EmptyState description="Nothing waiting." />;
  return (
    <div className="approval-list">
      {records.map((r) => (
        <Item key={r._id} asChild className="flex-nowrap rounded-none">
          <button onClick={() => openRecord(r)}>
            <ItemContent className="gap-0">
              <ItemTitle className="block">
                <b>{r.title}</b>
              </ItemTitle>
              <ItemDescription className="mt-[3px] line-clamp-none text-[11px] text-[#748198]">
                {r.reference} • {r.detail?.subject || String(r.columns?.value ?? "")}
              </ItemDescription>
            </ItemContent>
            <Status value={r.severity || r.status || "Open"} />
          </button>
        </Item>
      ))}
    </div>
  );
}
