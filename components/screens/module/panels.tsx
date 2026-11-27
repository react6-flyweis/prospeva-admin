"use client";

import { BadgeCheck, ChevronRight, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Panel, Pill } from "@/components/common/display";
import { humanize } from "@/lib/modules";
import { isObj, str, type Obj } from "@/lib/values";

function Banner({ value, tone = "route" }: { value: Obj; tone?: "route" | "rule" }) {
  if (tone === "rule")
    return (
      <Alert role="note" className="loan-rule">
        <span aria-hidden="true">
          <ShieldAlert />
        </span>
        <div>
          <b>{str(value.title)}</b>
          <p>{str(value.text || value.subtitle || value.description)}</p>
        </div>
      </Alert>
    );
  return (
    <Alert role="note" className="route-banner">
      <div>
        <SlidersHorizontal aria-hidden="true" />
        <span>
          <b>{str(value.title)}</b>
          {!!(value.subtitle || value.description) && (
            <small>
              {str(value.subtitle)}
              {value.subtitle && value.description ? " — " : ""}
              {str(value.description)}
            </small>
          )}
        </span>
      </div>
      {typeof value.draftChanges === "number" && <Pill tone="amber">{value.draftChanges} draft changes</Pill>}
      {!!value.badge && <Pill tone="blue">{str(value.badge)}</Pill>}
    </Alert>
  );
}

function Steps({ steps }: { steps: Obj[] }) {
  return (
    <div className="eligibility-steps" role="list" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => (
        <div key={i} role="listitem">
          <i aria-hidden="true">{str(s.step || i + 1)}</i>
          <span>
            <b>{str(s.title)}</b>
            <small>{str(s.subtitle)}</small>
          </span>
          {i < steps.length - 1 && <ChevronRight size={16} aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

function LabelValues({ items }: { items: Obj[] }) {
  return (
    <div className="type-strip">
      {items.map((x, i) => (
        <Card key={i} className="panel gap-0" style={{ padding: "12px 8px" }}>
          <b>{str(x.value)}</b>
          <span>{str(x.label)}</span>
        </Card>
      ))}
    </div>
  );
}

function LineList({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Panel title={title}>
      <div className="disclosures">
        {lines.map((x) => (
          <span key={x}>
            <BadgeCheck size={16} aria-hidden="true" />
            {x}
          </span>
        ))}
      </div>
    </Panel>
  );
}

/** Splits summary.panels into what renders above the metrics, below the records, and as scalar pills. */
export function splitPanels(panels: Obj | undefined, skip: string[] = []) {
  const top: React.ReactNode[] = [];
  const bottom: React.ReactNode[] = [];
  const scalars: { label: string; value: string }[] = [];
  for (const [key, value] of Object.entries(panels || {})) {
    if (skip.includes(key)) continue;
    if (typeof value === "number" || typeof value === "string") {
      scalars.push({ label: humanize(key), value: String(value) });
    } else if (Array.isArray(value) && value.every(isObj)) {
      if (value.some((x) => "step" in x)) top.push(<Steps key={key} steps={value} />);
      else if (value.every((x) => "label" in x && "value" in x)) top.push(<LabelValues key={key} items={value} />);
    } else if (isObj(value)) {
      if (Array.isArray(value.lines))
        bottom.push(<LineList key={key} title={str(value.title) || humanize(key)} lines={value.lines.map(str)} />);
      else if ("text" in value || /rule|control|correction|note|routine/i.test(key))
        bottom.push(<Banner key={key} value={value} tone="rule" />);
      else top.push(<Banner key={key} value={value} />);
    }
  }
  return { top, bottom, scalars };
}
