export type AgentStatus = "active" | "idle" | "failed" | "paused";

export type RunLogEntry = {
  id: string;
  status: "done" | "failed" | "running";
  trigger: string;
  duration: string;
  time: string;
};

export type Agent = {
  id: string;
  name: string;
  type: string;
  description: string;
  status: AgentStatus;
  lastRun: string;
  successRate: number;
  totalRuns: number;
  schedule: string;
  model: string;
  runs: RunLogEntry[];
};

export const MOCK_AGENTS: Agent[] = [
  {
    id: "competitor-research",
    name: "Competitor Research Agent",
    type: "Web Scrape",
    description:
      "Scrapes competitor pricing pages and summarizes weekly changes.",
    status: "active",
    lastRun: "2 min ago",
    successRate: 96,
    totalRuns: 128,
    schedule: "On demand + Fridays 10:00 PM",
    model: "Gemini 1.5 Flash",
    runs: [
      {
        id: "r1",
        status: "running",
        trigger: "Manual",
        duration: "—",
        time: "2 min ago",
      },
      {
        id: "r2",
        status: "done",
        trigger: "Manual",
        duration: "48s",
        time: "1 hr ago",
      },
      {
        id: "r3",
        status: "done",
        trigger: "Schedule",
        duration: "52s",
        time: "Yesterday",
      },
      {
        id: "r4",
        status: "failed",
        trigger: "Schedule",
        duration: "12s",
        time: "3 days ago",
      },
    ],
  },
  {
    id: "daily-news-summarizer",
    name: "Daily News Summarizer",
    type: "RAG Pipeline",
    description: "Pulls top industry news each morning and produces a digest.",
    status: "idle",
    lastRun: "1 hr ago",
    successRate: 100,
    totalRuns: 342,
    schedule: "Daily at 7:00 AM",
    model: "Groq Llama 3",
    runs: [
      {
        id: "r1",
        status: "done",
        trigger: "Schedule",
        duration: "31s",
        time: "1 hr ago",
      },
      {
        id: "r2",
        status: "done",
        trigger: "Schedule",
        duration: "29s",
        time: "Yesterday",
      },
      {
        id: "r3",
        status: "done",
        trigger: "Schedule",
        duration: "33s",
        time: "2 days ago",
      },
    ],
  },
  {
    id: "lead-scorer",
    name: "Lead Scorer",
    type: "Data Pipeline",
    description:
      "Scores inbound leads against ICP criteria and tags them in the CRM.",
    status: "failed",
    lastRun: "6 hrs ago",
    successRate: 74,
    totalRuns: 89,
    schedule: "Every 4 hours",
    model: "Gemini 1.5 Flash",
    runs: [
      {
        id: "r1",
        status: "failed",
        trigger: "Schedule",
        duration: "4s",
        time: "6 hrs ago",
      },
      {
        id: "r2",
        status: "done",
        trigger: "Schedule",
        duration: "22s",
        time: "10 hrs ago",
      },
      {
        id: "r3",
        status: "done",
        trigger: "Manual",
        duration: "19s",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "weekly-market-report",
    name: "Weekly Market Report",
    type: "RAG Pipeline",
    description: "Compiles a market summary report and emails it every Friday.",
    status: "paused",
    lastRun: "5 days ago",
    successRate: 100,
    totalRuns: 12,
    schedule: "Fridays at 10:00 PM (paused)",
    model: "Groq Llama 3",
    runs: [
      {
        id: "r1",
        status: "done",
        trigger: "Schedule",
        duration: "1m 12s",
        time: "5 days ago",
      },
      {
        id: "r2",
        status: "done",
        trigger: "Schedule",
        duration: "1m 08s",
        time: "12 days ago",
      },
    ],
  },
];

export function getAgentById(id: string) {
  return MOCK_AGENTS.find((agent) => agent.id === id);
}
