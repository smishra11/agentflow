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
- **Free-tier-only constraint:** Every service choice must have a genuinely usable free tier — e.g., Supabase (Auth, Postgres, Realtime), Vercel Hobby tier, Groq free API tier (Llama 3/GPT-OSS), FastAPI/Python backend (self-hosted or free tier PAAS).

## 3. Tech Stack & Architecture

- **Frontend:** Next.js 15 (App Router, standard compiler, **no** `src/` directory), React 19, TypeScript.
- **Backend (Execution Engine):** FastAPI (Python) using `APScheduler` for background CRON jobs and immediate task orchestration.
- **Styling:** Tailwind CSS v4, shadcn/ui (Radix UI, Nova/Geist preset, Zinc theme). Strictly OLED dark mode — no light-mode variant.
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth (`@supabase/ssr`, PKCE flow, cookie-based sessions), `pgvector`. Email confirmation required before login.
- **AI & Logic:** Groq Cloud API (`openai/gpt-oss-20b` for instant, free inference), Vercel AI SDK (upcoming for frontend chat).

### Folder Structure & Data Flow

```text
agentflow-core/
├── .gitignore
├── .vscode/
│   └── settings.json
├── backend/                          # FastAPI execution engine
│   ├── .env
│   ├── .gitignore
│   ├── auth.py
│   ├── crypto.py
│   ├── engine.py                     # APScheduler setup, Groq LLM integration, agent execution logic
│   ├── main.py                       # FastAPI app, /api/engine/deploy webhook, /api/dashboard data
│   ├── requirements.txt
│   └── api/
└── frontend/                         # Next.js app
    ├── .env.local                    # Environment variables
    ├── .gitignore
    ├── AGENTS.md                     # Project Context/Documentation
    ├── CLAUDE.md
    ├── components.json               # shadcn/ui configuration
    ├── eslint.config.mjs
    ├── next-env.d.ts
    ├── next.config.ts
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── proxy.ts
    ├── README.md
    ├── tsconfig.json
    ├── actions/                      # Next.js Server Actions (Data mutations)
    │   ├── agents.ts                 # deployAgent (inserts to Supabase, triggers FastAPI webhook)
    │   ├── backend-ping.ts
    │   ├── connectors.ts             # disconnectTool (Server Action to remove DB token & refresh UI)
    │   └── dashboard.ts
    ├── app/                          # Next.js App Router root
    │   ├── favicon.ico
    │   ├── globals.css               # Tailwind entry point
    │   ├── layout.tsx                # Root layout
    │   ├── (auth)/                   # Authentication routes (group)
    │   │   ├── confirm/
    │   │   │   └── route.ts
    │   │   ├── forgot-password/
    │   │   │   ├── actions.ts
    │   │   │   └── page.tsx
    │   │   ├── login/
    │   │   │   ├── actions.ts
    │   │   │   └── page.tsx
    │   │   ├── reset-password/
    │   │   │   ├── actions.ts
    │   │   │   └── page.tsx
    │   │   ├── signup/
    │   │   │   ├── actions.ts
    │   │   │   └── page.tsx
    │   │   └── layout.tsx
    │   ├── (dashboard)/              # Main application routes (group)
    │   │   ├── layout.tsx            # Main Dashboard Layout
    │   │   ├── page.tsx              # Command Center (Dashboard Home)
    │   │   ├── agents/               # Agents Overview & Creation
    │   │   │   ├── [id]/
    │   │   │   │   └── page.tsx      # Single Agent View
    │   │   │   ├── create/           # Manual Agent Builder
    │   │   │   │   ├── create-agent-form.tsx
    │   │   │   │   └── page.tsx
    │   │   │   ├── agent-table.tsx
    │   │   │   ├── mock-data.ts
    │   │   │   └── page.tsx
    │   │   ├── chat/                 # Orchestrator AI Builder Chat
    │   │   │   ├── chat-input.tsx
    │   │   │   ├── page.tsx
    │   │   │   └── tool-status-card.tsx
    │   │   ├── connectors/           # Integrations Marketplace
    │   │   │   ├── BrandIcon.tsx
    │   │   │   ├── connector-card.tsx
    │   │   │   ├── mock-data.ts
    │   │   │   └── page.tsx
    │   │   └── settings/             # User Settings
    │   │       ├── actions.ts
    │   │       ├── page.tsx
    │   │       └── profile-form.tsx
    │   └── api/                      # API Routes
    │       └── connect/
    │           └── google/
    │               └── callback/
    │                   └── route.ts  # Google OAuth callback handler
    ├── components/                   # Shared React Components
    │   ├── app-sidebar.tsx           # Main navigation sidebar
    │   ├── dashboard/
    │   │   ├── dashboard-header.tsx
    │   │   ├── user-menu-actions.ts
    │   │   └── user-menu.tsx
    │   ├── deploy/
    │   │   └── preflight-check.tsx   # Upfront Auth logic component
    │   └── ui/                       # shadcn/ui generic components
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dropdown-menu.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── scroll-area.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── table.tsx
    │       ├── textarea.tsx
    │       └── tooltip.tsx
    ├── hooks/                        # Custom React Hooks
    │   └── use-mobile.ts
    ├── lib/                          # Utility Functions & Config
    │   ├── connector.ts              # OAuth utility (getOAuthUrl)
    │   ├── utils.ts                  # Tailwind merge utility (cn)
    │   └── supabase/
    │       ├── client.ts
    │       ├── middleware.ts
    │       └── server.ts
    └── public/                       # Static assets
        ├── file.svg
        ├── globe.svg
        ├── next.svg
        ├── vercel.svg
        └── window.svg
```

### 3a. Deployment & Execution — Detailed Flow Spec

1. **Task Definition** — The user configures an agent (Name, Prompt, Tools, CRON schedule) via the UI or Chat.
2. **Database Handoff** — The Next.js Server Action (`deployAgent`) saves the configuration to the Supabase `agents` table.
3. **Execution Webhook** — Next.js immediately pings the FastAPI backend (`POST /api/engine/deploy`) with the new agent payload.
4. **Traffic Cop Routing (FastAPI)**
   - If schedule is `"once"`: Bypasses the scheduler and runs immediately via a background task.
   - If recurring: Forces `APScheduler` to sync with Supabase and schedule the CRON job (using `misfire_grace_time=None` to handle offline periods).
5. **The Brain (Groq)** — The engine logs a `running` state in `agent_runs`, pings the Groq API for LLM inference, and saves the AI's response text into the `output` column of the `agent_runs` table, marking it `completed`.

### 3b. Chat-to-Agent Builder — Planned Flow Spec

The deployment utilizes an "Upfront Authorization" model. Whether an agent is deployed manually via the UI or conversationally via the chat, it must pass the Pre-flight gate.

1. **Task Definition** — The user states their goal in natural language (e.g., "Summarize my daily GitHub PRs"). The AI identifies the underlying intent.
2. **Connector Validation (The Pre-flight Gate)** — The Orchestrator AI checks whether the required tools (e.g., GitHub, Slack) are already connected in the `user_connectors` table. If not, it renders an inline Generative UI card directly in the chat to connect them (using the `getOAuthUrl` logic), halting deployment until authorization is granted.
3. **Schedule Extraction** — The AI asks "How often should I run this?" and parses the user's natural-language answer into a standard CRON expression.
4. **Confirmation & Backend Handoff** — The AI compiles the payload (`name`, `system_prompt`, `tools`, `cron`). Both the Chat AI and the manual `/agents/create` form send this exact JSON payload through the deployment flow in 3a (`deployAgent` → `POST /api/engine/deploy`) for database insertion and scheduling.

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
- **Agent State Modeling (UI vs Engine):** The UI presents statuses like `active`, `running`, `paused`, `error`, `completed`, and `canceled`. Shadcn dropdown menus must dynamically enable/disable actions (Pause, Continue, Cancel) based on these strict states. The invisible stretched-link pattern is used for clickable table rows with isolated z-indexes for action buttons.
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
- [x] Upgraded `AgentsTable` to a real hybrid Client/Server component with Shadcn Dropdown Actions, handling click-isolation for row navigation vs. menu toggles.
- [x] Built the FastAPI Backend Execution Engine (`engine.py`, `main.py`) utilizing `APScheduler`.
- [x] Wired the `/api/engine/deploy` webhook bridging Next.js Server Actions to the Python orchestrator.
- [x] Integrated Groq Cloud API (`openai/gpt-oss-20b`) to replace dummy execution wait times with lightning-fast, free LLM processing.
- [x] Updated `agent_runs` schema to include an `output` column and successfully logged live AI inferences to the database.

### Known Bugs / Broken

None currently confirmed. The pipeline successfully executes "Only Once" agents end-to-end.

### Known Limitations (deliberately deferred)

- Table UI actions (Pause/Delete via Dropdown) click correctly but are not yet wired to backend database mutations.
- Chat interface is still using static mock data pending the Vercel AI SDK implementation.
- Agents do not yet have access to their assigned Tool authentication tokens during execution.
- Google OAuth buttons on login/signup are non-functional placeholders.

## 6. Next Task to Implement & Roadmap

### ▶ IMMEDIATE NEXT TASK

**Build the Agent Details Page (UI):** Now that the execution engine is successfully logging AI responses (the `output` column in `agent_runs`), we need to build the `app/(dashboard)/agents/[id]/page.tsx` view.

- It must fetch a single agent's configuration.
- It must display an **Execution History** feed/table mapping through the `agent_runs` table so the user can read exactly what the AI generated during each scheduled run.

### Upcoming Roadmap

1. **Wire UI Actions:** Connect the Pause/Continue/Delete dropdown actions in the `AgentsTable` to Next.js Server Actions to update the Supabase `status` column and dynamically reflect those changes in the backend scheduler.
2. **Give Agents Hands (Tools):** Modify `engine.py` to retrieve stored Google OAuth tokens from the database and pass them to the LLM, enabling real API calls (e.g., reading/sending emails).
3. **Chat-to-Agent Builder:** Implement Vercel AI SDK `useChat`, Generative UI for inline connector tools, and Orchestrator payload generation in the `/chat` route.
4. **Live Updates:** Implement Supabase Realtime to stream execution logs directly to the dashboard metrics.
5. Build a real workspace switcher (consider a rounded-square badge to visually distinguish it from the circular personal-account avatar).
6. _(Deferred)_ Connect Resend for auth emails before real-user usage.

## 7. Environment & Setup

```bash
# Frontend (from agentflow-core/frontend)
cd frontend
npm install
npm run dev

# Backend (from agentflow-core/backend)
cd backend
pip install fastapi "uvicorn[standard]" apscheduler groq python-dotenv supabase httpx
uvicorn main:app --reload
```

Required Environment Variables (`frontend/.env.local`):

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
