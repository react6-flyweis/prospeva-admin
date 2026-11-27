"use client";

import { Activity, AlertTriangle, BadgeCheck, ShieldCheck, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/*
 * App-level display pieces. They render shadcn primitives and carry the original
 * design's CSS classes (globals.css), which override the shadcn defaults, so the
 * look is unchanged. Utilities passed here only cancel shadcn defaults the CSS
 * does not set (e.g. Card's padding/gap/direction).
 */

export type Tone = "green" | "amber" | "red" | "blue" | "slate";

export function Pill({ children, tone = "slate", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("pill border-0", tone, className)}>
      {children}
    </Badge>
  );
}

export function toneFor(value: string): Tone {
  if (/settled|verified|operational|ready|resolved|active|allowed|approved|connected|synced|posted|low|online|complete/i.test(value))
    return "green";
  if (/review|processing|monitoring|pending|open|priority|medium|draft|queued|waiting/i.test(value)) return "amber";
  if (/critical|degraded|held|failed|high|restricted|suspended|escalated|blocked|unavailable|offline/i.test(value)) return "red";
  return "blue";
}

export function Status({ value }: { value: string }) {
  return <Pill tone={toneFor(value)}>{value}</Pill>;
}

export function Metric({
  label,
  value,
  delta,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Card className="metric flex-row">
      <div className={`metric-icon ${tone}`} aria-hidden="true">
        <Icon size={20} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {delta && <span>{delta}</span>}
      </div>
    </Card>
  );
}

const METRIC_ICONS: LucideIcon[] = [Activity, BadgeCheck, AlertTriangle, ShieldCheck];
const METRIC_TONES: Tone[] = ["blue", "green", "amber", "red"];

/** A row of metric cards; icons and tones cycle by position. Uses the 3-column layout unless there are exactly 4. */
export function MetricGrid({ metrics, compact }: { metrics: { label: string; value: string; sublabel?: string }[]; compact?: boolean }) {
  if (!metrics.length) return null;
  const isCompact = compact ?? metrics.length !== 4;
  return (
    <div className={`metrics ${isCompact ? "compact" : ""}`}>
      {metrics.map((m, i) => (
        <Metric
          key={m.label}
          label={m.label}
          value={m.value}
          delta={m.sublabel}
          icon={METRIC_ICONS[i % METRIC_ICONS.length]}
          tone={METRIC_TONES[i % METRIC_TONES.length]}
        />
      ))}
    </div>
  );
}

/** Titled card section. `title` may be a node (e.g. a skeleton). */
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("panel gap-0 py-0", className)}>
      <CardHeader className="panel-head">
        <CardTitle className="[font-weight:inherit] [line-height:inherit]">
          <h2>{title}</h2>
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      {children}
    </Card>
  );
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
