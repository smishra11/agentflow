import { MOCK_CONNECTORS } from "./mock-data";
import { ConnectorCard } from "./connector-card";
import { createClient } from "@/lib/supabase/server";

// ADD THIS LINE: Forces Next.js to always fetch fresh data from Supabase
export const dynamic = "force-dynamic";

export default async function ConnectorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch the user's actual live connections from the database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activeProviders: any[] = [];
  if (user) {
    const { data } = await supabase
      .from("user_connectors")
      .select("provider, provider_account_id, updated_at")
      .eq("user_id", user.id);

    activeProviders = data || [];
  }

  // 2. Merge the DB state with our static catalog
  const realConnectors = MOCK_CONNECTORS.map((connector) => {
    // Map the specific tool IDs to the general database provider names
    let dbProviderName = connector.id.toLowerCase();
    if (["gmail", "googlecalendar", "googledrive"].includes(dbProviderName)) {
      dbProviderName = "google";
    }

    // Check if the user has this provider connected in the DB
    const activeConnection = activeProviders.find(
      (p) => p.provider === dbProviderName,
    );

    if (activeConnection) {
      return {
        ...connector,
        status: "connected" as const,
        configSummary: activeConnection.provider_account_id,
        // Format the timestamp to a readable date
        connectedAt: new Date(activeConnection.updated_at).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        ),
      };
    }

    // Force default to disconnected if not found in DB
    return {
      ...connector,
      status: "disconnected" as const,
      configSummary: undefined,
      connectedAt: undefined,
    };
  });

  const connectedCount = realConnectors.filter(
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
            {connectedCount} of {realConnectors.length} Active
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {realConnectors.map((connector) => (
          <ConnectorCard key={connector.id} connector={connector} />
        ))}
      </div>
    </div>
  );
}
