import { createClient } from "@/lib/supabase/server";
import { Plus, MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentsTable } from "./agent-table";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let agents: any[] = [];

  if (user) {
    // Fetch live agents from the database, newest first
    const { data } = await supabase
      .from("agents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      agents = data;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor your deployed agents.
          </p>
        </div>

        {/* Only show top button if agents exist to avoid duplicate CTAs */}
        {agents.length > 0 && (
          <Link href="/agents/create">
            <Button
              size="sm"
              className="h-9 shadow-sm bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="mr-1 h-4 w-4" />
              Deploy Agent
            </Button>
          </Link>
        )}
      </div>

      {agents.length === 0 ? (
        /* Premium Empty State */
        <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-border/40 bg-background/40 py-12 text-center backdrop-blur-md">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-zinc-800/50 shadow-sm">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            No agents deployed yet
          </h2>
          <p className="mt-2 max-w-105 text-sm leading-relaxed text-muted-foreground">
            Create an autonomous agent manually using the configuration
            pipeline, or chat with the Orchestrator AI to build one
            automatically.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link href="/agents/create">
              <Button className="h-9 bg-foreground text-background hover:bg-foreground/90">
                <Plus className="mr-2 h-4 w-4" />
                Deploy Manually
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant="outline"
                className="h-9 border-border/40 bg-background/50 hover:bg-background/80"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI to Build
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <AgentsTable agents={agents} />
      )}
    </div>
  );
}
