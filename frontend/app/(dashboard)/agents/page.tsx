import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "./agent-card";
import { MOCK_AGENTS } from "./mock-data";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor your deployed agents.
          </p>
        </div>
        <Button size="sm" className="h-9 shadow-sm">
          <Plus className="mr-1 h-4 w-4" />
          Deploy Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
