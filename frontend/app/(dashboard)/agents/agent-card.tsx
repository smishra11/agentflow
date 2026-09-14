import Link from "next/link";
import { Bot, ChevronRight } from "lucide-react";
import type { Agent, AgentStatus } from "./mock-data";

const STATUS_STYLES: Record<
  AgentStatus,
  { label: string; dot: string; badge: string; pulse?: boolean }
> = {
  active: {
    label: "Active",
    dot: "bg-blue-500",
    badge: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    pulse: true,
  },
  idle: {
    label: "Idle",
    dot: "bg-zinc-500",
    badge: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  },
  failed: {
    label: "Failed",
    dot: "bg-red-500",
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
  },
  paused: {
    label: "Paused",
    dot: "bg-amber-500",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
};

export function AgentCard({ agent }: { agent: Agent }) {
  const style = STATUS_STYLES[agent.status];

  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group flex flex-col justify-between rounded-xl border border-border/40 bg-background/40 p-4 transition-colors hover:border-border/80 hover:bg-background/60"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.badge}`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {style.pulse && (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${style.dot}`}
                />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`}
              />
            </span>
            {style.label}
          </span>
        </div>

        <p className="mt-3 text-sm font-semibold leading-tight">{agent.name}</p>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {agent.type}
        </p>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {agent.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
        <div className="flex gap-4">
          <div>
            <p className="text-muted-foreground">Success</p>
            <p className="font-medium">{agent.successRate}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last run</p>
            <p className="font-medium">{agent.lastRun}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
