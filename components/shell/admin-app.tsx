"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "@/lib/api/queries";
import { pageFromPath, type PageDef } from "@/lib/modules";
import { useEnvironment, useReadOnly } from "@/lib/navigation";
import { useAuth } from "@/lib/stores/auth";
import { useUI } from "@/lib/stores/ui";
import { useHydrated } from "@/lib/use-hydrated";
import { AISheetHost } from "./ai-sheet";
import { ModeContext, SearchContext } from "./contexts";
import { PageContent } from "./page-content";
import { PageHead } from "./page-head";
import { RecordSheetHost } from "./record-sheet";
import { AppSidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** Client-side auth guard: renders the shell only with a token; otherwise goes to /login. */
export function AdminApp() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const token = useAuth((s) => s.token);

  useEffect(() => {
    if (hydrated && !token) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, token, pathname, router]);

  if (!hydrated || !token) return <div className="login-page" aria-busy="true" />;
  return <Shell page={pageFromPath(pathname)} />;
}

function Shell({ page }: { page: PageDef | undefined }) {
  const client = useQueryClient();
  // Top-bar search text. The legacy demo screens also filter by it (SearchContext).
  const [query, setQuery] = useState("");
  const openAI = useUI((s) => s.openAI);
  const user = useAuth((s) => s.user);
  const session = useSession();
  const env = useEnvironment();
  const readOnly = useReadOnly();

  return (
    <ModeContext.Provider value={readOnly}>
      <SearchContext.Provider value={query}>
        <SidebarProvider className="app-shell" style={{ "--sidebar-width": "264px" } as React.CSSProperties}>
          <a className="skip-link" href="#workspace">
            Skip to workspace
          </a>
          <AppSidebar page={page} />
          {/* min-w-0: a flex item may not grow past the viewport, so wide tables scroll inside .table-scroll instead of the page. */}
          <SidebarInset className="main min-w-0" id="workspace">
            <Topbar query={query} onQueryChange={setQuery} />
            <PageHead page={page} onRefresh={() => client.invalidateQueries()} onAI={() => openAI()} />
            {page && !page.key && (
              <div className="demo-banner" role="note">
                <b>Demonstration</b>
                <span>This screen has no backend API yet. Data and requests stay in this browser.</span>
              </div>
            )}
            <div className="content">
              <PageContent page={page} />
            </div>
            <footer>
              <span>Prospeva Admin Control</span>
              <span>
                {env} • Control plane {session.data?.controlPlaneStatus ?? "connecting"}
              </span>
              <span>{user?.email}</span>
            </footer>
          </SidebarInset>
          <button className="ai-launcher" onClick={() => openAI()}>
            <Sparkles size={18} />
            ProspevaAI
          </button>
          <RecordSheetHost />
          <AISheetHost />
        </SidebarProvider>
      </SearchContext.Provider>
    </ModeContext.Provider>
  );
}
