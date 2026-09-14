"use client";

import { useState } from "react";
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
} from "lucide-react";

import { testBackendHandshake } from "@/actions/backend-ping";

// Timeframe options for the interactive dropdown
const TIMEFRAMES = [
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "all", label: "All time" },
];

// Upgraded mock data with trend indicators
const metrics = [
  {
    title: "Active Runs",
    value: "3",
    trend: "+2",
    trendUp: true,
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "group-hover:border-blue-500/30",
  },
  {
    title: "Completed",
    value: "128",
    trend: "+14%",
    trendUp: true,
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "group-hover:border-emerald-500/30",
  },
  {
    title: "Failed",
    value: "2",
    trend: "-1",
    trendUp: true,
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "group-hover:border-rose-500/30",
  },
  {
    title: "Pending",
    value: "5",
    trend: "+1",
    trendUp: false,
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "group-hover:border-amber-500/30",
  },
];

const recentActivity = [
  {
    agent: "Competitor Research",
    status: "Running",
    time: "2 min ago",
    type: "Web Scrape",
    color: "bg-blue-500",
  },
  {
    agent: "Daily News Summarizer",
    status: "Completed",
    time: "1 hr ago",
    type: "RAG Pipeline",
    color: "bg-emerald-500",
  },
  {
    agent: "Lead Scorer",
    status: "Failed",
    time: "3 hrs ago",
    type: "API Call",
    color: "bg-rose-500",
  },
  {
    agent: "GitHub Issue Triage",
    status: "Completed",
    time: "5 hrs ago",
    type: "Webhook",
    color: "bg-emerald-500",
  },
  {
    agent: "Email Drafter",
    status: "Completed",
    time: "12 hrs ago",
    type: "Text Gen",
    color: "bg-emerald-500",
  },
];

export default function CommandCenterPage() {
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[1]); // Defaults to Last 7 days

  const handleTestPing = async () => {
    const result = await testBackendHandshake();
    if (result.success) {
      console.log("SUCCESS!", result.data);
      alert(`Handshake Success! Python says: ${result.data.message}`);
    } else {
      console.error("FAILED!", result.error);
      alert(`Failed: ${result.error}`);
    }
  };

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
          {/* Interactive Contextual Dashboard Control */}
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

          {/* Primary Creation CTA */}
          <Button size="sm" className="h-9 shadow-sm" onClick={handleTestPing}>
            <Plus className="mr-1 h-4 w-4" />
            Deploy Agent
          </Button>
        </div>
      </div>

      {/* METRICS ROW (Interactive Bento) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className={`group relative overflow-hidden border-border/40 bg-background/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-muted/20 ${metric.border}`}
          >
            {/* Lighter Unhovered Watermark */}
            <metric.icon className="pointer-events-none absolute -bottom-4 -right-4 z-0 h-28 w-28 text-zinc-700/20 transition-opacity duration-300 group-hover:opacity-0" />

            {/* Colored Hover Watermark */}
            <metric.icon
              className={`pointer-events-none absolute -bottom-4 -right-4 z-0 h-28 w-28 opacity-0 transition-opacity duration-300 group-hover:opacity-15 ${metric.color}`}
            />

            {/* Content wrapper with relative z-10 to stay above the watermarks */}
            <div className="relative z-10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                  {metric.value}
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
        {/* RECENT ACTIVITY (Takes up 4 columns) */}
        <Card className="flex flex-col border-border/40 bg-background/40 shadow-sm backdrop-blur-md lg:col-span-4">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              Live Execution Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-80">
              <div className="flex flex-col">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-border/30 p-4 transition-colors hover:bg-muted/30 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {/* Pulsing Status Dot */}
                      <div className="relative mt-1 flex h-2 w-2">
                        {activity.status === "Running" && (
                          <span
                            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${activity.color}`}
                          ></span>
                        )}
                        <span
                          className={`relative inline-flex h-2 w-2 rounded-full ${activity.color}`}
                        ></span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-none text-foreground/90">
                          {activity.agent}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {activity.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs font-medium ${
                          activity.status === "Running"
                            ? "text-blue-500"
                            : activity.status === "Completed"
                              ? "text-emerald-500"
                              : "text-rose-500"
                        }`}
                      >
                        {activity.status}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* UPCOMING SCHEDULES (Takes up 3 columns) */}
        <Card className="flex flex-col border-border/40 bg-background/40 shadow-sm backdrop-blur-md lg:col-span-3">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              Scheduled Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 p-4">
            {/* Active Schedule Item */}
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

            {/* Add New Schedule Button */}
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
