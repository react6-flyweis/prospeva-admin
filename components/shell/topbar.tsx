"use client";

import { useState } from "react";
import { Bell, LogOut, Menu, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { initials } from "@/components/common/display";
import { useSession, useSignOut } from "@/lib/api/queries";
import { useGo } from "@/lib/navigation";
import { useAuth } from "@/lib/stores/auth";
import { ProfileDialog } from "./profile-dialog";
import { TopSearch } from "./top-search";

export function Topbar({ query, onQueryChange }: { query: string; onQueryChange: (q: string) => void }) {
  const go = useGo();
  const { setOpenMobile } = useSidebar();
  const user = useAuth((s) => s.user);
  const signOut = useSignOut();
  const session = useSession();
  const name = session.data?.admin.name ?? user?.fullName ?? "Admin";
  const notifications = session.data?.notificationsCount ?? 0;
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="topbar">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenMobile(true)} aria-label="Open navigation">
        <Menu />
      </Button>
      <TopSearch query={query} onQueryChange={onQueryChange} />
      <Button
        variant="outline"
        size="icon"
        className="icon-btn ml-auto"
        aria-label={notifications ? `Notifications (${notifications})` : "Notifications"}
        onClick={() => go("exceptionCenter")}
      >
        <Bell size={20} />
        {!!notifications && <span aria-hidden="true">{notifications}</span>}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="profile h-auto px-1" aria-label={`Account menu for ${name}`}>
            <div className="avatar small" aria-hidden="true">
              {initials(name)}
            </div>
            <span>{name.split(" ")[0]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="font-normal">
            <div className="text-sm font-semibold">{name}</div>
            {user?.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
            <UserRound /> My profile
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={signOut}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
