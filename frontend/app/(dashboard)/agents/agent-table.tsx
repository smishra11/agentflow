import Link from "next/link";
import { Bot, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type AgentStatus = "active" | "paused" | "error" | "completed";

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
  paused: {
    label: "Paused",
    dot: "bg-amber-500",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
};

const formatFrequency = (cron?: string) => {
  if (!cron) return "Manual";
  if (cron === "once") return "Only Once";
  if (cron === "0 * * * *") return "Hourly";
  if (cron === "0 */6 * * *") return "Every 6 Hours";
  if (cron === "0 9 * * *") return "Daily (9 AM)";
  if (cron === "0 17 * * *") return "Daily (5 PM)";
  if (cron === "0 9 * * 1") return "Weekly";
  return "Custom";
};

// Removed "use client" and useRouter! This is now a 100% Server Component.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AgentsTable({ agents }: { agents: any[] }) {
  if (!agents || agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-background/40 py-24 backdrop-blur-md">
        <Bot className="mb-4 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">
          No agents deployed
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Deploy your first agent to see it listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-background/40 backdrop-blur-md">
      <Table>
        <TableHeader className="bg-zinc-900/20 border-b border-border/40">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="w-[40%] text-xs text-muted-foreground h-11">
              Agent
            </TableHead>
            <TableHead className="text-xs text-muted-foreground h-11">
              Status
            </TableHead>
            <TableHead className="hidden md:table-cell text-xs text-muted-foreground h-11">
              Capabilities
            </TableHead>
            <TableHead className="text-xs text-muted-foreground h-11">
              Frequency
            </TableHead>
            <TableHead className="hidden lg:table-cell text-xs text-muted-foreground h-11">
              Deployed
            </TableHead>
            <TableHead className="text-right h-11"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => {
            const style =
              STATUS_STYLES[agent.status as AgentStatus] ||
              STATUS_STYLES.active;
            const createdDate = new Date(agent.created_at).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              },
            );

            return (
              <TableRow
                key={agent.id}
                className="group relative border-b border-border/40 border-dashed last:border-none hover:bg-background/60 transition-colors"
              >
                {/* Agent Identity Column */}
                <TableCell className="py-4">
                  {/* FIXED: The link is now z-10 so it sits ON TOP of all text and catches the click */}
                  <Link
                    href={`/agents/${agent.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View ${agent.name}`}
                  />

                  {/* FIXED: Removed z-10 and pointer-events classes. The text sits naturally underneath the link. */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-zinc-800/50 shadow-sm">
                      <Bot className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {agent.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground max-w-[250px] xl:max-w-[350px]">
                        {agent.system_prompt}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Status Column */}
                <TableCell className="py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${style.badge}`}
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
                </TableCell>

                {/* Capabilities Column */}
                <TableCell className="hidden md:table-cell py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">
                      {agent.tools?.length || 0}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {agent.tools?.length === 1 ? "Tool" : "Tools"}
                    </span>
                  </div>
                </TableCell>

                {/* Frequency Column */}
                <TableCell className="py-4">
                  <span className="text-xs font-medium text-foreground">
                    {formatFrequency(agent.cron_schedule)}
                  </span>
                </TableCell>

                {/* Deployed Date Column */}
                <TableCell className="hidden lg:table-cell py-4">
                  <span className="text-xs text-muted-foreground">
                    {createdDate}
                  </span>
                </TableCell>

                {/* Actions Column */}
                <TableCell className="py-4 pr-4">
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
