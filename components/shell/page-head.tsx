"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextSkeleton } from "@/components/common/skeletons";
import { useModuleSummary } from "@/lib/api/queries";
import type { PageDef } from "@/lib/modules";

export function PageHead({ page, onRefresh, onAI }: { page: PageDef | undefined; onRefresh: () => void; onAI: () => void }) {
  const hasSummary = !!page?.key && page.key !== "overview";
  const summary = useModuleSummary(hasSummary ? page.key : null);
  const title = page?.name ?? "Page not found";
  const subtitle = page?.key === "overview" ? "Prospeva Control Plane home." : (summary.data?.subtitle ?? "");
  return (
    <div className="page-head">
      <div>
        <div className="breadcrumbs">
          <span>Admin / {title}</span>
        </div>
        <h1>{title}</h1>
        {hasSummary && summary.isPending ? <TextSkeleton /> : <p>{subtitle}</p>}
      </div>
      <div className="head-actions">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw size={16} />
          Refresh
        </Button>
        <Button onClick={onAI}>
          <Sparkles size={16} />
          Ask ProspevaAI
        </Button>
      </div>
    </div>
  );
}
