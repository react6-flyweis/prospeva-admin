"use client";

import { Panel } from "@/components/common/display";
import { Restrictions } from "@/components/legacy/restrictions";
import { Revenue } from "@/components/legacy/revenue";
import { AIScreen } from "@/components/screens/ai-screen";
import { ModuleScreen } from "@/components/screens/module/module-screen";
import { OverviewScreen } from "@/components/screens/overview-screen";
import type { PageDef } from "@/lib/modules";

/** Picks the screen for a page. Most pages render through the generic ModuleScreen. */
export function PageContent({ page }: { page: PageDef | undefined }) {
  if (!page)
    return (
      <Panel title="Page not found">
        <p className="empty-state">This page does not exist. Pick a section from the menu.</p>
      </Panel>
    );
  if (page.name === "Revenue & Settlements") return <Revenue />;
  if (page.name === "Account Restrictions") return <Restrictions />;
  if (page.key === "overview") return <OverviewScreen />;
  if (page.key === "prospevaAI") return <AIScreen />;
  return <ModuleScreen key={page.key} page={page} />;
}
