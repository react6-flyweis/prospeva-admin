"use client";

import { useQueryClient } from "@tanstack/react-query";
import { MetricGrid, Pill } from "@/components/common/display";
import { ModuleSkeleton } from "@/components/common/skeletons";
import { ErrorState } from "@/components/common/states";
import { qk, useModuleRecords, useModuleSummary } from "@/lib/api/queries";
import type { PageDef } from "@/lib/modules";
import { ActionStrip } from "./module-actions";
import { splitPanels } from "./panels";
import { PolicyCards } from "./policy-cards";
import { ModuleRecords } from "./records-table";
import { ToggleCards, TopToggle } from "./toggles";
import { ViewAsUserLookup } from "./view-as-user";

/** Sub-module record lists shown under a parent module (their summary endpoint returns 404). */
const SUB_MODULES: Record<string, { key: string; title: string }[]> = {
  employers: [
    { key: "employers_liveEvents", title: "Live workforce events" },
    { key: "employers_connectionHealth", title: "Connection health" },
    { key: "employers_leaveRequests", title: "Leave requests" },
  ],
};

/**
 * Modules whose records include card kinds (see docs/admin-api/README.md). Their cards are
 * fetched in one unpaged request; the paged table skips them. The API has no `kind` filter,
 * so page counts for "mixed" modules include the cards.
 */
const CARD_MODULES: Record<string, "only" | "mixed"> = { featureControls: "only", connectivity: "mixed", approvals: "mixed" };

/** Generic screen for a control-plane module, driven by /<module>/summary and /<module>/records. */
export function ModuleScreen({ page }: { page: PageDef }) {
  const key = page.key!;
  const client = useQueryClient();
  const summary = useModuleSummary(key);
  const cards = useModuleRecords(key, { limit: 100 }, { enabled: !!CARD_MODULES[key] });
  const reload = () => void client.invalidateQueries({ queryKey: qk.module(key) });

  if (summary.error) return <ErrorState message={summary.error.message} onRetry={reload} />;
  if (!summary.data) return <ModuleSkeleton label={`Loading ${page.name}…`} />;

  const s = summary.data;
  const policyHeading = typeof s.panels?.policyHeading === "string" ? s.panels.policyHeading : "Policies";
  const panels = splitPanels(s.panels, ["policyHeading"]);
  const cardDocs = cards.data?.docs ?? [];
  const toggleRecords = cardDocs.filter((r) => r.kind === "toggleCard");
  const policyRecords = cardDocs.filter((r) => r.kind === "policyCard");
  const subModules = SUB_MODULES[key];

  return (
    <>
      {s.topToggle && <TopToggle summary={s} />}
      {panels.top}
      <MetricGrid metrics={s.metrics} />
      {panels.scalars.length > 0 && (
        <div className="action-strip">
          {panels.scalars.map((x) => (
            <Pill key={x.label} tone="blue">
              {x.label}: {x.value}
            </Pill>
          ))}
        </div>
      )}
      <ActionStrip summary={s} onReload={reload} />
      {cards.error && <ErrorState message={cards.error.message} onRetry={() => cards.refetch()} />}
      {toggleRecords.length > 0 && <ToggleCards records={toggleRecords} />}
      {!subModules && CARD_MODULES[key] !== "only" && <ModuleRecords module={key} title={`${s.title} records`} />}
      {policyRecords.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <PolicyCards title={policyHeading} records={policyRecords} />
        </div>
      )}
      {subModules?.map((sub) => (
        <div key={sub.key} style={{ marginTop: 14 }}>
          <ModuleRecords module={sub.key} title={sub.title} />
        </div>
      ))}
      {key === "viewAsUser" && <ViewAsUserLookup />}
      {panels.bottom.length > 0 && <div style={{ display: "grid", gap: 14, marginTop: 14 }}>{panels.bottom}</div>}
    </>
  );
}
