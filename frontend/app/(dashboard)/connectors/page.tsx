// app/(dashboard)/connectors/page.tsx
import { MOCK_CONNECTORS } from "./mock-data";
import { ConnectorCard } from "./connector-card";
import { Button } from "@/components/ui/button";

export default function ConnectorsPage() {
  const connectedCount = MOCK_CONNECTORS.filter(
    (c) => c.status === "connected",
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Connectors & Integrations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Link free-tier services, webhooks, and communication channels for
            autonomous agent runs.
          </p>
        </div>

        <div>
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
            {connectedCount} of {MOCK_CONNECTORS.length} Active
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_CONNECTORS.map((connector) => (
          <ConnectorCard key={connector.id} connector={connector} />
        ))}
      </div>
    </div>
  );
}
