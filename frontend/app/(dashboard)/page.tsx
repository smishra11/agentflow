"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Terminal,
  CalendarClock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";

import { fetchDashboardData } from "@/actions/dashboard";
import Link from "next/link";

// --- TYPESCRIPT INTERFACES ---
interface AgentRunActivity {
  id: string;
  status: string;
  created_at: string;
  agents: {
    name: string;
    description: string | null;
  } | null;
}

interface DashboardData {
  metrics: Record<string, number>;
  recent_activity: AgentRunActivity[];
}
// -----------------------------

const TIMEFRAMES = [
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "all", label: "All time" },
];

const METRICS_CONFIG = [
  {
    id: "running",
    title: "Active Runs",
    trend: "+2",
    trendUp: true,
    icon: Activity,
    color: "text-blue-500",
    border: "group-hover:border-blue-500/30",
  },
  {
    id: "completed",
    title: "Completed",
    trend: "+14%",
    trendUp: true,
    icon: CheckCircle2,
    color: "text-emerald-500",
    border: "group-hover:border-emerald-500/30",
  },
  {
    id: "failed",
    title: "Failed",
    trend: "-1",
    trendUp: true,
    icon: XCircle,
    color: "text-rose-500",
    border: "group-hover:border-rose-500/30",
  },
  {
    id: "pending",
    title: "Pending",
    trend: "+1",
    trendUp: false,
    icon: Clock,
    color: "text-amber-500",
    border: "group-hover:border-amber-500/30",
  },
];

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "running":
      return { bg: "bg-blue-500", text: "text-blue-500" };
    case "completed":
      return { bg: "bg-emerald-500", text: "text-emerald-500" };
    case "failed":
      return { bg: "bg-rose-500", text: "text-rose-500" };
    default:
      return { bg: "bg-amber-500", text: "text-amber-500" };
  }
};

export default function CommandCenterPage() {
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[1]);

  // Strictly typed state prevents TS errors
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    metrics: { pending: 0, running: 0, completed: 0, failed: 0 },
    recent_activity: [],
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const result = await fetchDashboardData();
      if (result.success && result.data) {
        setData(result.data as DashboardData);
      } else {
        console.error("Failed to load dashboard:", result.error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
      {/* HEADER SECTION */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your active agents and background operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-36 justify-between border-border/40 bg-background/40 text-muted-foreground backdrop-blur-md hover:bg-zinc-900/50 hover:text-foreground"
              >
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {timeframe.label}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-35 border-border/40 bg-zinc-950/90 backdrop-blur-md"
            >
              {TIMEFRAMES.map((tf) => (
                <DropdownMenuItem
                  key={tf.id}
                  onClick={() => setTimeframe(tf)}
                  className="flex items-center justify-between cursor-default focus:bg-zinc-900/50 text-xs font-medium"
                >
                  {tf.label}
                  {timeframe.id === tf.id && (
                    <Check className="h-3.5 w-3.5 text-foreground" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/agents/create">
            <Button size="sm" className="h-9 shadow-sm">
              <Plus className="mr-1 h-4 w-4" />
              Deploy Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS_CONFIG.map((metric) => (
          <Card
            key={metric.id}
            className={`group relative overflow-hidden border-border/40 bg-background/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-muted/20 ${metric.border}`}
          >
            <metric.icon className="pointer-events-none absolute -bottom-4 -right-4 z-0 h-28 w-28 text-zinc-700/20 transition-opacity duration-300 group-hover:opacity-0" />
            <metric.icon
              className={`pointer-events-none absolute -bottom-4 -right-4 z-0 h-28 w-28 opacity-0 transition-opacity duration-300 group-hover:opacity-15 ${metric.color}`}
            />

            <div className="relative z-10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* FIX: h-8 flex items-center prevents the card from changing height when the spinner disappears */}
                <div className="flex h-8 items-center text-2xl font-bold tracking-tight">
                  {isLoading ? (
                    /* FIX: Wrapped in a perfect square container to stabilize the rotational axis */
                    <div className="flex h-6 w-6 items-center justify-center">
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground/50" />
                    </div>
                  ) : (
                    data.metrics[metric.id] || 0
                  )}
                </div>
                <div className="mt-1 flex items-center text-xs">
                  <span
                    className={`flex items-center ${
                      metric.trendUp ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {metric.trendUp ? (
                      <ArrowUpRight className="mr-0.5 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-0.5 h-3 w-3" />
                    )}
                    {metric.trend}
                  </span>
                  <span className="ml-1.5 text-muted-foreground">
                    vs last week
                  </span>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* BOTTOM BENTO GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* RECENT ACTIVITY */}
        <Card className="flex flex-col border-border/40 bg-background/40 shadow-sm backdrop-blur-md lg:col-span-4">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              Live Execution Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {/* FIX: Bypassing ScrollArea for empty/loading states guarantees perfect vertical/horizontal centering */}
            {isLoading ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
                Syncing with AI Core...
              </div>
            ) : data.recent_activity.length === 0 ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                No recent executions found.
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="flex flex-col">
                  {data.recent_activity.map((activity) => {
                    const styles = getStatusStyles(activity.status);

                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between border-b border-border/30 p-4 transition-colors hover:bg-muted/30 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative mt-1 flex h-2 w-2">
                            {activity.status.toLowerCase() === "running" && (
                              <span
                                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${styles.bg}`}
                              ></span>
                            )}
                            <span
                              className={`relative inline-flex h-2 w-2 rounded-full ${styles.bg}`}
                            ></span>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium leading-none text-foreground/90">
                              {activity.agents?.name || "Unknown Agent"}
                            </p>
                            <p className="font-mono text-xs capitalize text-muted-foreground">
                              {activity.status} Task
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xs font-medium capitalize ${styles.text}`}
                          >
                            {activity.status}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {formatTimeAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* UPCOMING SCHEDULES */}
        <Card className="flex flex-col border-border/40 bg-background/40 shadow-sm backdrop-blur-md lg:col-span-3">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              Scheduled Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 p-4">
            <div className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 bg-muted/10 p-3 transition-colors hover:bg-muted/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background transition-colors group-hover:border-primary/30">
                <Clock className="h-4 w-4 text-foreground/70" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-foreground/90">
                  Weekly Market Report
                </p>
                <p className="text-xs text-muted-foreground">
                  Runs every Friday at 10:00 PM
                </p>
              </div>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-transparent p-4 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
              <Plus className="h-4 w-4" />
              Create New Schedule
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
