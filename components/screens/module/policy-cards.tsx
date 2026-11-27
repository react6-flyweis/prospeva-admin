"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Panel } from "@/components/common/display";
import type { ControlRecord } from "@/lib/api/schemas";
import { useUI } from "@/lib/stores/ui";

/** Records of kind "policyCard". */
export function PolicyCards({ title, records }: { title: string; records: ControlRecord[] }) {
  const openRecord = useUI((s) => s.openRecord);
  return (
    <Panel title={title}>
      <div className="policy-grid" role="list">
        {records.map((r) => (
          <Item key={r._id} role="listitem" className="flex-nowrap rounded-none">
            <ItemMedia aria-hidden="true">
              <ShieldCheck />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle className="block text-[13px] font-bold">{r.title}</ItemTitle>
              {r.subtitle && <ItemDescription className="text-[11px] text-[#728096]">{r.subtitle}</ItemDescription>}
            </ItemContent>
            <ItemActions>
              <Button variant="outline" onClick={() => openRecord(r)} aria-label={`Review ${r.title}`}>
                Review
              </Button>
            </ItemActions>
          </Item>
        ))}
      </div>
    </Panel>
  );
}
