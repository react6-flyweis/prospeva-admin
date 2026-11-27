"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, CircleDollarSign, ShieldCheck, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { initials } from "@/components/common/display";
import { useBadges, useSession } from "@/lib/api/queries";
import { NAV, hrefFor, type PageDef } from "@/lib/modules";
import { useAuth } from "@/lib/stores/auth";
import { useUI } from "@/lib/stores/ui";

/** shadcn Sidebar in the original blue design. On mobile it opens as a sheet (SidebarProvider handles that). */
export function AppSidebar({ page }: { page: PageDef | undefined }) {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const collapsed = useUI((s) => s.collapsed);
  const toggleGroup = useUI((s) => s.toggleGroup);
  const user = useAuth((s) => s.user);
  const session = useSession();
  const badges = useBadges();
  const admin = session.data?.admin ?? { name: user?.fullName ?? "Admin", role: "" };

  const nav = (p: PageDef) => {
    router.push(hrefFor(p));
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="gap-0 p-0">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <CircleDollarSign />
          </div>
          <div>
            <b>Prospeva</b>
            <span>Admin Control</span>
          </div>
          {isMobile && (
            <button className="mobile-close" onClick={() => setOpenMobile(false)} aria-label="Close menu">
              <X />
            </button>
          )}
        </div>
        <div className="operator">
          <div className="avatar" aria-hidden="true">
            {initials(admin.name)}
          </div>
          <div>
            <b>{admin.name}</b>
            {session.isPending ? <Skeleton className="mt-1 h-3 w-24 bg-white/20" /> : <span>{admin.role}</span>}
          </div>
          <ShieldCheck size={17} aria-hidden="true" />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <nav aria-label="Main navigation">
          {NAV.map((g) => (
            <Collapsible key={g.group} open={!collapsed[g.group]} onOpenChange={() => toggleGroup(g.group)} asChild>
              <SidebarGroup className="nav-group">
                <CollapsibleTrigger className="nav-group-toggle">
                  {g.group}
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${collapsed[g.group] ? "-rotate-90" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="gap-0">
                    {g.items.map((i) => {
                      const badge = i.key ? badges.data?.[i.key] : undefined;
                      const active = page?.slug === i.slug;
                      return (
                        <SidebarMenuItem key={i.slug}>
                          <SidebarMenuButton
                            isActive={active}
                            aria-current={active ? "page" : undefined}
                            className={active ? "active" : ""}
                            onClick={() => nav(i)}
                          >
                            <i.icon size={18} />
                            <span>{i.name}</span>
                          </SidebarMenuButton>
                          {!!badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="p-0">
        <div className="secure">
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <b>Secure workspace</b>
            {session.data ? (
              <span>
                {[session.data.secureWorkspace.mfaEnforced && "MFA enforced", session.data.secureWorkspace.sessionMonitored && "Session monitored"]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            ) : (
              <Skeleton className="mt-1 h-3 w-36 bg-white/20" />
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
