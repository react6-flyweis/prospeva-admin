"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { Item } from "@/components/ui/item";
import { Pill } from "@/components/common/display";
import { AIScreenSkeleton } from "@/components/common/skeletons";
import { ErrorState } from "@/components/common/states";
import { useModuleSummary } from "@/lib/api/queries";
import { useUI } from "@/lib/stores/ui";
import { isObj, str } from "@/lib/values";

/** ProspevaAI landing page: banner plus capability cards that open the AI sheet. */
export function AIScreen() {
  const openAI = useUI((s) => s.openAI);
  const res = useModuleSummary("prospevaAI");
  if (res.error) return <ErrorState message={res.error.message} onRetry={() => res.refetch()} />;
  if (!res.data) return <AIScreenSkeleton />;
  const panels = res.data.panels ?? {};
  const banner = isObj(panels.banner) ? panels.banner : {};
  const caps = Array.isArray(panels.capabilities) ? panels.capabilities.filter(isObj) : [];
  return (
    <div className="ai-page">
      <div className="ai-hero">
        <div className="orb" aria-hidden="true">
          <Sparkles />
        </div>
        <div>
          {!!banner.badge && <Pill tone="blue">{str(banner.badge)}</Pill>}
          <h2>{str(banner.title) || res.data.title}</h2>
          <p>{str(banner.subtitle) || res.data.subtitle}</p>
        </div>
      </div>
      <div className="ai-grid">
        {caps.map((c) => (
          <Item key={str(c.key)} asChild className="block">
            <button onClick={() => openAI({ capability: str(c.key), prompt: str(c.title), label: str(c.title) })}>
              <Sparkles aria-hidden="true" />
              <b>{str(c.title)}</b>
              <span>{str(c.subtitle)}</span>
              <ChevronRight aria-hidden="true" />
            </button>
          </Item>
        ))}
      </div>
    </div>
  );
}
