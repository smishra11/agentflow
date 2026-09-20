# PROJECT_CONTEXT.md

## 1. Project Identity

**AgentFlow** is a multi-user, autonomous AI agent platform built as a personal project. It enables users to build, manage, chat with, and schedule AI agents to perform background workflows. The platform strictly utilizes a "100% free" tech stack (a hard constraint, not just a preference) while maintaining a premium, "AI-native" SaaS aesthetic (OLED dark mode, glassmorphism, functional elegance).

## 2. Goal / North Star

- **Done State:** A deployed platform where a user can construct an agent via a conversational interface, deploy it, and monitor its background executions without hitting a paywall.
- **Core Workflow (Chat-to-Agent Builder):**
  - **Command Center:** Overview of live running agents and system status.
  - **Chat Interface:** Acts as a specialized builder (Orchestrator AI). The user chats with the AI to define a task. The AI identifies required connectors, prompts the user to configure them inline via Generative UI if missing, determines execution frequency, and deploys the background agent.
  - **Agents Section:** Displays all deployed agents, their granular run histories, and provides an "Advanced Mode" manual deployment form (`/agents/create`).
  - **Connectors Section:** A marketplace-style view of all available plugins and linked accounts with functional OAuth connection/disconnection.
- **Design Metric:** The UI must feel like a "Pro Max" enterprise tool (think Vercel or Linear). High density, mathematically perfect alignments, subtle micro-interactions, fixed native-app scrolling behavior, locked container widths.
- **Non-Goals (Out of Scope):** Paid infrastructure, heavy state management libraries (no Redux/Zustand), complex 3D/heavy animation libraries, light-mode theming (deliberately discarded — see Conventions).
- **Free-tier-only constraint:** Every service choice must have a genuinely usable free tier — e.g., Supabase (Auth, Postgres, Realtime), Vercel Hobby tier, Groq/Gemini free API tiers, FastAPI/Python backend (self-hosted or free tier PAAS).

## 3. Tech Stack & Architecture

- **Frontend:** Next.js 15 (App Router, standard compiler, **no** `src/` directory), React 19, TypeScript.
- **Backend (Execution Engine):** FastAPI (Python) to handle actual agent deployment, tool execution, and LLM orchestration.
- **Styling:** Tailwind CSS v4, shadcn/ui (Radix UI, Nova/Geist preset, Zinc theme). Strictly OLED dark mode — no light-mode variant.
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth (`@supabase/ssr`, PKCE flow, cookie-based sessions), `pgvector`. Email confirmation required before login.
- **AI & Logic:** Vercel AI SDK (with Generative UI for inline connector tools), free LLM APIs (Gemini 1.5, Groq Llama 3).

### Folder Structure & Data Flow

```text
agent-platform/
├── actions/
│   └── connectors.ts            # disconnectTool (Server Action to remove DB token & refresh UI)
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── reset-password/
│   │   └── layout.tsx
│   ├── auth/
│   │   └── confirm/             # exchanges PKCE `code` param
│   ├── (dashboard)/
│   │   ├── agents/
│   │   │   ├── create/
│   │   │   │   ├── create-agent-form.tsx # Client: 3-step deployment UI (Configure -> Tools -> Pre-flight)
│   │   │   │   └── page.tsx          # Server: fetches active user_connectors, renders form
│   │   │   ├── mock-data.ts
│   │   │   ├── agent-card.tsx
│   │   │   ├── page.tsx          # grid of agent cards, "+ Deploy Agent" routing to /agents/create
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx
│   │   │   ├── chat-input.tsx
│   │   │   └── tool-status-card.tsx
│   │   ├── connectors/
│   │   │   ├── BrandIcon.tsx         # SVG icons for tools used across Connectors and Preflight
│   │   │   ├── mock-data.ts
│   │   │   ├── connector-card.tsx    # bento card, OAuth connect routing, destructive Unplug disconnect
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── deploy/
│   │   └── preflight-check.tsx     # Authorization gate comparing assigned tools to active DB connections
│   ├── ui/
│   ├── app-sidebar.tsx
│   └── dashboard/
│       ├── dashboard-header.tsx
│       ├── user-menu.tsx
│       └── user-menu-actions.ts
├── lib/
│   ├── connectors.ts               # getOAuthUrl utility for dynamic Google Auth generation
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── proxy.ts
└── .env.local
```

### 3a. Chat-to-Agent Builder — Detailed Flow Spec

The deployment utilizes an "Upfront Authorization" model. Whether an agent is deployed manually via the UI or conversationally via the chat, it must pass the Pre-flight gate.

1. **Task Definition** — The user states their goal in natural language (e.g., "Summarize my daily GitHub PRs"). The AI identifies the underlying intent.
2. **Connector Validation (The Pre-flight Gate)** — The Orchestrator AI checks whether the required tools (e.g., GitHub, Slack) are already connected in the `user_connectors` table. If not, it renders an inline Generative UI card directly in the chat to connect them (using the `getOAuthUrl` logic), halting deployment until authorization is granted.
3. **Schedule Extraction** — The AI asks "How often should I run this?" and parses the user's natural-language answer into a standard CRON expression.
4. **Confirmation & Backend Handoff** — The AI compiles the payload (`name`, `system_prompt`, `tools`, `cron`). Both the Chat AI and the manual `/agents/create` form send this exact JSON payload to the FastAPI backend (`POST /api/agents/deploy`) for database insertion and scheduling.

## 4. Conventions & Constraints

- **Architecture Rule:** Do not over-engineer. Use standard Next.js Server Actions for data mutations (like `disconnectTool`). Use `.assign()` for external routing (like OAuth redirects) to avoid React compiler immutability errors.
- **Server Action placement rule:** Inline `"use server"` functions only work in Server Components. A Client Component must import a Server Action from a separate `"use server"` file.
- **File naming rule:** Server Action files must be named `actions.ts` (plural) or grouped logically in an `/actions` directory.
- **Route-aware header title (current approach):** `DashboardHeader` is a `"use client"` component using `usePathname()` to resolve titles instantly on navigation.
- **Scrollbar & Layout constraint:** The dashboard layout uses a rigid `h-screen overflow-hidden` wrapper on `<SidebarProvider>`, delegating `flex-1 min-h-0 overflow-y-auto` exclusively to `<main>`.
- **Premium Form Layouts:** Multi-step forms must use locked container widths (e.g., `w-full max-w-4xl`) and consistent minimum heights to prevent UI jumping/resizing during state changes. Complex icon arrays should be defined outside the component body to prevent re-render flickering.
- **Badge styling convention:** Status pills use `rounded-full border border-{color}-500/20 bg-{color}-500/10 px-2 py-0.5 text-[11px] font-medium text-{color}-400`.
- **Pulsing-dot convention:** An actively-running state gets a small dot with an `animate-ping` overlay + solid inner dot.
- **Destructive hover convention:** Actionable-but-dangerous items (e.g., Connector "Unplug" action) reveal a destructive-styled state (red border/bg) only on hover and must require a user confirmation prompt before executing.
- **Agent state modeling:** An agent's "currently running" state (derived from `agent_runs`) and its "enabled for future runs" state (a separate `status` field) are two different dimensions.
- **Theme decision:** Strictly OLED dark mode is core to the product identity. No light mode.
- **Auth Rule:** All auth emails route through `/auth/confirm` first.

## 5. Current State & Completed Tasks

**Date Stamped:** September 2026

### Completed Tasks

- [x] Project initialization, dashboard shell, bento grids, Supabase connection.
- [x] Full auth loop: signup, login, password reset, middleware guards.
- [x] `/settings` — editable Profile data.
- [x] UI Shell for `/chat`, `/agents`, `/agents/[id]`, and `/connectors`.
- [x] Implemented `getOAuthUrl` utility for centralized, dynamic Google Workspace authentication.
- [x] Connected real DB state to `ConnectorCard`. Implemented `disconnectTool` Server Action with premium Unplug hover state and confirmation dialog.
- [x] Defined Supabase `agents` table schema (RLS, `agent_status` enum, JSONB `tools` array).
- [x] Built the `/agents/create` manual deployment pipeline (Configure → Assign Tools → Pre-flight).
- [x] Upgraded form UI to Pro-Max aesthetics: visual stepper, `BrandIcon` integration, locked widths, and glassmorphism styling.
- [x] Wired global "Deploy Agent" buttons to route to the new creation pipeline.

### Known Bugs / Broken

None currently confirmed. UI foundation is stable and routing correctly.

### Known Limitations (deliberately deferred)

- Chat interface is still using static mock data pending the Vercel AI SDK implementation.
- Agent run histories and stat cards are mock data pending Inngest/FastAPI wiring.
- Google OAuth buttons on login/signup are non-functional placeholders.

## 6. Next Task to Implement & Roadmap

### ▶ IMMEDIATE NEXT TASK

**Build the FastAPI Backend Integration:** The Next.js frontend is fully ready to deploy agents (via the `/agents/create` form and the future chat Orchestrator). We need to build the actual FastAPI endpoint (e.g., `POST /api/agents/deploy`) that will receive the JSON payload, insert the final agent record into the Supabase `agents` table, and register the agent with the execution engine.

### Upcoming Roadmap

1. Connect the `handleDeploy` function in Next.js to the new FastAPI backend endpoint.
2. Wire real behavior in `/chat`: Vercel AI SDK `useChat`, Generative UI for inline connector tools, and Orchestrator payload generation.
3. Wire agent execution: agent run/pause/cancel actions, background job scheduling (Inngest or FastAPI background tasks).
4. Wire live updates: Supabase Realtime for streaming execution logs back to the UI.
5. Build a real workspace switcher (consider a rounded-square badge to visually distinguish it from the circular personal-account avatar).
6. _(Deferred)_ Connect Resend for auth emails before real-user usage.

## 7. Environment & Setup

```bash
npm install
npm run dev
```

Required Environment Variables (`.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
# Never expose the SERVICE_ROLE_KEY to NEXT_PUBLIC
```

## 8. Glossary

- **Pro Max UI:** High information density, subtle borders (`border-border/40`), blurred backgrounds (`bg-background/40 backdrop-blur-xl`), smooth hover states.
- **Bento Grid:** The Apple-style grid layout used on Command Center and Connectors.
- **Upfront Authorization:** The architectural rule that an agent cannot be deployed until all required external tools are verified as connected (The Pre-flight Check).
- **PKCE flow:** Auth code-exchange pattern used by `@supabase/ssr`.
- **Orchestrator AI:** The meta-agent running the Chat interface that builds and schedules sub-agents based on natural language prompts.
- **`isRunning` vs. `status`:** An agent's live "currently executing" state is distinct from its "enabled/paused" state.
