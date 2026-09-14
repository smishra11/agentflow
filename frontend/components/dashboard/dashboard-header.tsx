"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROUTE_TITLES: Record<string, { title: string; badge?: string }> = {
  "/": { title: "Command Center", badge: "Live" },
  "/chat": { title: "Chat" },
  "/agents": { title: "Agents" },
  "/connectors": { title: "Connectors" },
  "/settings": { title: "Settings" },
};

function getRouteMeta(pathname: string) {
  if (pathname.startsWith("/agents/") && pathname !== "/agents") {
    return { title: "Agent Details" };
  }
  return ROUTE_TITLES[pathname] ?? { title: "AgentFlow" };
}

// Static mock data for the UI-first pass
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Agent 'Data Scraper' encountered an error",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Connector 'Slack' successfully verified",
    time: "1h ago",
    unread: false,
  },
  {
    id: 3,
    title: "Welcome to AgentFlow! Deploy your first agent.",
    time: "2d ago",
    unread: false,
  },
];

export function DashboardHeader({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const { title, badge } = getRouteMeta(pathname);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
        <Separator className="mt-1 h-6 bg-border/60" orientation="vertical" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </span>
          {badge && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="group relative h-8 w-8 text-muted-foreground hover:bg-zinc-800/50 hover:text-foreground transition-colors"
            >
              <Bell className="h-4 w-4 transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110" />

              {/* Premium Monochrome Numerical Badge */}
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-100 px-1 text-[9px] font-bold text-zinc-900 ring-2 ring-background/80 shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 border-border/40 bg-zinc-950/90 backdrop-blur-md"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="p-0 font-semibold text-foreground">
                Notifications
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <span className="text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  Mark all as read
                </span>
              )}
            </div>
            <DropdownMenuSeparator className="bg-border/40" />

            <div className="flex max-h-75 flex-col overflow-y-auto py-1">
              {MOCK_NOTIFICATIONS.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3 cursor-default focus:bg-zinc-900/50"
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span
                      className={`text-xs font-medium leading-tight ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {notification.title}
                    </span>
                    {notification.unread && (
                      <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {notification.time}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu email={email} name={name} />
      </div>
    </header>
  );
}
