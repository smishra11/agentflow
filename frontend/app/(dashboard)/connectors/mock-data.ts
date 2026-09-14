// app/(dashboard)/connectors/mock-data.ts

export type ConnectorCategory =
  | "communication"
  | "developer"
  | "storage"
  | "custom";

export type ConnectorStatus = "connected" | "disconnected" | "error";

export interface Connector {
  id: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  freeTierNote: string;
  connectedAt?: string;
  configSummary?: string;
}

export const MOCK_CONNECTORS: Connector[] = [
  {
    id: "resend",
    name: "Resend (Email)",
    description:
      "Send transactional alerts and automated agent digests via email API.",
    category: "communication",
    status: "connected",
    freeTierNote: "3,000 emails/mo free",
    connectedAt: "2 days ago",
    configSummary: "sender@agentflow.dev",
  },
  {
    id: "slack",
    name: "Slack Webhooks",
    description:
      "Post notifications, agent run results, and action prompts to channels.",
    category: "communication",
    status: "connected",
    freeTierNote: "Unlimited incoming webhooks",
    connectedAt: "5 days ago",
    configSummary: "#agent-alerts",
  },
  {
    id: "discord",
    name: "Discord Webhook",
    description:
      "Stream live execution traces and failure alerts to community channels.",
    category: "communication",
    status: "disconnected",
    freeTierNote: "100% free unlimited webhook feeds",
  },
  {
    id: "github",
    name: "GitHub",
    description:
      "Trigger workflows from commit events, create PRs, and read repositories.",
    category: "developer",
    status: "disconnected",
    freeTierNote: "Free personal access tokens & public events",
  },
  {
    id: "supabase-db",
    name: "Supabase PostgreSQL",
    description:
      "Store agent memory, relational tables, and vector embeddings directly.",
    category: "storage",
    status: "connected",
    freeTierNote: "500MB free database tier included",
    connectedAt: "1 week ago",
    configSummary: "db.agentflow.internal",
  },
];
