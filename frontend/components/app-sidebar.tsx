"use client";

import {
  Activity,
  Bot,
  MessageSquare,
  Plug,
  LayoutDashboard,
  Clock,
  Sparkles,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const primaryItems = [
  { title: "Command Center", url: "/", icon: LayoutDashboard },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Agents", url: "/agents", icon: Bot },
  { title: "Connectors", url: "/connectors", icon: Plug },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="border-r border-border/40"
    >
      {/* HEADER */}
      <SidebarHeader className="border-b border-border/40 p-2 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Added 'group' here to trigger the logo scale on hover */}
            <SidebarMenuButton size="lg" className="hover:bg-transparent group">
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 transition-transform group-hover:scale-105">
                <Activity className="size-4 font-bold" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
                <span className="truncate font-bold tracking-tight text-foreground">
                  AgentFlow
                </span>
                <span className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
                  v1.0 • Personal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-2 py-4 space-y-5">
        {/* Main Navigation */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 text-[10px] font-medium tracking-wider uppercase text-muted-foreground/70 group-data-[collapsible=icon]:hidden mb-1">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {primaryItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-8 text-sm font-medium transition-colors" /* Reduced to h-8 for higher density */
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Chats */}
        <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="px-2 text-[10px] font-medium tracking-wider uppercase text-muted-foreground/70 flex items-center justify-between mb-1">
            <span className="truncate">Recent Chats</span>
            <Clock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="h-7 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Link href="/chat">
                    <Sparkles className="size-3 shrink-0 text-muted-foreground/50" />
                    <span className="truncate">Competitor Research Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t border-border/40 p-2 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="group">
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors group-hover:bg-zinc-700">
                <User className="size-4" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-1">
                <span className="truncate font-semibold text-foreground">
                  Workspace
                </span>
                <span className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
                  Free Tier
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
