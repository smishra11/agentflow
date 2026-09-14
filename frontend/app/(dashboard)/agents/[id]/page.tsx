import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  Play,
  Square,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAgentById, type RunLogEntry } from "../mock-data";

const RUN_STATUS_STYLES: Record<
  RunLogEntry["status"],
  { icon: typeof CheckCircle2; className: string; label: string }
> = {
  done: {
    icon: CheckCircle2,
    className: "text-emerald-500",
    label: "Completed",
  },
  failed: { icon: XCircle, className: "text-red-500", label: "Failed" },
  running: {
    icon: Loader2,
    className: "text-blue-400 animate-spin",
    label: "Running",
  },
};

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgentById(id);

  if (!agent) {
    notFound();
  }

  const isRunning = agent.runs.some((run) => run.status === "running");

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to agents
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {agent.name}
            </h1>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isRunning ? (
            <Button disabled className="h-9 text-sm font-medium">
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Running...
            </Button>
          ) : agent.status === "paused" ? (
            <Button className="h-9 text-sm font-medium">
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Resume
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                title="Pause"
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button className="h-9 text-sm font-medium">Run now</Button>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/40 bg-background/40">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Total Runs</p>
            <p className="text-2xl font-bold mt-1">{agent.totalRuns}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-background/40">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold mt-1">{agent.successRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-background/40">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Last Run</p>
            <p className="text-2xl font-bold mt-1">{agent.lastRun}</p>
          </CardContent>
        </Card>
      </div>

      {/* Run history */}
      <Card className="border-border/40 bg-background/40">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Run History</CardTitle>
          <CardDescription className="text-xs">
            Recent executions of this agent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {agent.runs.map((run) => {
            const style = RUN_STATUS_STYLES[run.status];
            const Icon = style.icon;
            return (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-lg border border-border/40 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${style.className}`} />
                  <div>
                    <p className="text-xs font-medium leading-tight">
                      {style.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Trigger: {run.trigger}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {run.status === "running" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] text-destructive hover:text-destructive"
                    >
                      <Square className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  )}
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>{run.duration}</p>
                    <p>{run.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="border-border/40 bg-background/40">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Read-only for now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium font-mono">{agent.type}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">Schedule</span>
            <span className="font-medium">{agent.schedule}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Model</span>
            <span className="font-medium">{agent.model}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
