"use client";

import { Network, ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Panel, Status } from "@/components/common/display";
import type { ControlRecord, ModuleSummary } from "@/lib/api/schemas";
import { useRecordToggle, useTopToggle } from "@/lib/api/queries";
import { humanize } from "@/lib/modules";
import { useReadOnly } from "@/lib/navigation";
import { useUI } from "@/lib/stores/ui";

/** Module-wide switch shown as a banner (e.g. risk engine, routing). */
export function TopToggle({ summary }: { summary: ModuleSummary }) {
  const readOnly = useReadOnly();
  const toggle = useTopToggle();
  const t = summary.topToggle!;
  const isRisk = summary.key === "risk";
  return (
    <Alert role="region" aria-label={t.label} className={`route-banner ${isRisk ? "risk" : ""}`}>
      <div>
        {isRisk ? <ShieldAlert aria-hidden="true" /> : <Network aria-hidden="true" />}
        <span>
          <b>{t.label}</b>
          <small>{t.sublabel}</small>
        </span>
      </div>
      <Switch
        aria-label={t.label}
        disabled={readOnly || toggle.isPending}
        checked={toggle.isPending ? toggle.variables.enabled : t.enabled}
        onCheckedChange={(enabled) => toggle.mutate({ module: summary.key, enabled, label: t.label })}
      />
    </Alert>
  );
}

/** Records of kind "toggleCard": one card per record with an on/off switch. */
export function ToggleCards({ records }: { records: ControlRecord[] }) {
  const readOnly = useReadOnly();
  const openRecord = useUI((s) => s.openRecord);
  const toggle = useRecordToggle();
  return (
    <div className="feature-grid" style={{ marginBottom: 14 }}>
      {records.map((r) => {
        const pending = toggle.isPending && toggle.variables.id === r._id;
        const enabled = pending ? toggle.variables.enabled : !!r.enabled;
        return (
          <Panel
            key={r._id}
            title={r.title}
            action={
              <Switch
                aria-label={`Toggle ${r.title}`}
                disabled={readOnly || pending}
                checked={enabled}
                onCheckedChange={(v) => toggle.mutate({ module: r.module, id: r._id, enabled: v, label: r.title })}
              />
            }
          >
            {r.subtitle && <p className="muted">{r.subtitle}</p>}
            {r.columns && (
              <dl>
                {Object.entries(r.columns).map(([k, v]) => (
                  <div key={k}>
                    <dt>{humanize(k)}</dt>
                    <dd>{String(v)}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="feature-state">
              <Status value={enabled ? "Active" : "Paused"} />
              <Button variant="outline" onClick={() => openRecord(r)}>
                Details
              </Button>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
