// app/(dashboard)/connectors/mock-data.ts

export type ConnectorCategory =
  | "communication"
  | "developer"
  | "storage"
  | "productivity"
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
  // --- COMMUNICATION ---
  {
    id: "gmail",
    name: "Gmail API",
    description:
      "Read, categorize, and draft responses to emails automatically.",
    category: "communication",
    status: "connected",
    freeTierNote: "1B quota units/day free",
    connectedAt: "1 day ago",
    configSummary: "user@gmail.com",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Post notifications, agent run results, and action prompts to channels.",
    category: "communication",
    status: "connected",
    freeTierNote: "Unlimited internal workspace usage",
    connectedAt: "5 days ago",
    configSummary: "#agent-alerts",
  },
  {
    id: "discord",
    name: "Discord",
    description:
      "Stream live execution traces and failure alerts to community servers.",
    category: "communication",
    status: "disconnected",
    freeTierNote: "100% free unlimited webhooks",
  },

  // --- PRODUCTIVITY ---
  {
    id: "googlecalendar",
    name: "Google Calendar",
    description:
      "Find available slots, resolve meeting conflicts, and schedule events.",
    category: "productivity",
    status: "disconnected",
    freeTierNote: "Massive free tier for developers",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Create pages, update databases, and summarize documents.",
    category: "productivity",
    status: "disconnected",
    freeTierNote: "Free internal workspace integration",
  },

  // --- STORAGE & DATA ---
  {
    id: "googledrive",
    name: "Google Drive",
    description:
      "Read documents, upload generated reports, and manage folders.",
    category: "storage",
    status: "disconnected",
    freeTierNote: "15GB free storage pool",
  },
  {
    id: "supabase",
    name: "Supabase",
    description:
      "Store agent memory, relational tables, and vector embeddings.",
    category: "storage",
    status: "connected",
    freeTierNote: "500MB free database tier",
    connectedAt: "1 week ago",
    configSummary: "db.agentflow.internal",
  },

  // --- DEVELOPER ---
  {
    id: "github",
    name: "GitHub",
    description: "Trigger workflows, review PRs, and triage repository issues.",
    category: "developer",
    status: "disconnected",
    freeTierNote: "Free personal access tokens",
  },
  {
    id: "linear",
    name: "Linear",
    description:
      "Create issues, update project statuses, and sync engineering tasks.",
    category: "developer",
    status: "disconnected",
    freeTierNote: "Free standard API access",
  },

  // --- CUSTOM ---
  {
    id: "webhook",
    name: "Custom Webhook",
    description:
      "Send generic HTTP POST payloads to any external service or API.",
    category: "custom",
    status: "disconnected",
    freeTierNote: "Zero limits",
  },
];
