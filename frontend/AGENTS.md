# PROJECT_CONTEXT.md

## 1. Project Identity

**AgentFlow** is a multi-user, autonomous AI agent platform built as a personal project. It enables users to build, manage, chat with, and schedule AI agents to perform background workflows. The platform strictly utilizes a "100% free" tech stack (a hard constraint, not just a preference) while maintaining a premium, "AI-native" SaaS aesthetic (OLED dark mode, glassmorphism, functional elegance).

## 2. Goal / North Star

- **Done State:** A deployed platform where a user can construct an agent via a conversational interface, deploy it, and monitor its background executions without hitting a paywall.
- **Core Workflow (Chat-to-Agent Builder):**
  - **Command Center:** Overview of live running agents and system status.
  - **Chat Interface:** Acts as a specialized builder. The user chats with the AI (via Vercel AI SDK + Groq/Gemini) to define a task. The AI identifies required connectors, prompts the user to configure them inline via Generative UI if missing, determines execution frequency, and deploys the background agent. See **Section 3a** for the full step-by-step spec of this flow.
  - **Agents Section:** Displays all deployed agents and their granular run histories.
  - **Connectors Section:** A marketplace-style view of all available plugins and linked accounts.
- **Design Metric:** The UI must feel like a "Pro Max" enterprise tool (think Vercel or Linear). High density, mathematically perfect alignments, subtle micro-interactions, fixed native-app scrolling behavior.
- **Non-Goals (Out of Scope):** Paid infrastructure, heavy state management libraries (no Redux/Zustand), complex 3D/heavy animation libraries, light-mode theming (deliberately discarded — see Conventions).
- **Free-tier-only constraint:** Every service choice must have a genuinely usable free tier — e.g., Supabase (Auth, Postgres, Realtime), Inngest (130k background events/mo), Resend (3,000 emails/month), Vercel Hobby tier, Groq/Gemini free API tiers.

## 3. Tech Stack & Architecture

- **Core:** Next.js 15 (App Router, standard compiler, **no** `src/` directory), React 19, TypeScript.
- **Styling:** Tailwind CSS v4, shadcn/ui (Radix UI, Nova/Geist preset, Zinc theme). Strictly OLED dark mode — no light-mode variant.
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth (`@supabase/ssr`, PKCE flow, cookie-based sessions), `pgvector`. Email confirmation required before login.
- **AI & Logic:** Vercel AI SDK (with Generative UI for inline connector tools), free LLM APIs (Gemini 1.5, Groq Llama 3), Inngest (Background jobs/CRON) — planned, not yet implemented.
- **UI Strategy:** Deliberately built the **entire UI with static mock data first** across all dashboard pages to finalize layouts before touching the database schema. This phase is now complete.

**Folder Structure & Data Flow**

```text
agent-platform/
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   │   ├── actions.ts        # forgotPassword — resetPasswordForEmail via /auth/confirm
│   │   │   └── page.tsx           # icon success state, echoes submitted email
│   │   ├── login/
│   │   │   ├── actions.ts        # login — signInWithPassword
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   ├── actions.ts        # signup — includes duplicate-email detection (empty identities[] check), stores full_name in user_metadata
│   │   │   └── page.tsx           # icon success state ("confirm your email")
│   │   ├── reset-password/
│   │   │   ├── actions.ts        # resetPassword — updateUser({password}), redirects to /login?reset=success
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── auth/
│   │   └── confirm/
│   │       └── route.ts          # exchanges PKCE `code` param for a real session before redirecting to `next`
│   ├── (dashboard)/
│   │   ├── agents/
│   │   │   ├── mock-data.ts        # Agent/RunLogEntry types + MOCK_AGENTS array, getAgentById()
│   │   │   ├── agent-card.tsx       # status-aware card (active/idle/failed/paused badges, pulsing dot)
│   │   │   ├── page.tsx              # grid of agent cards, "+ Deploy Agent" button
│   │   │   └── [id]/
│   │   │       └── page.tsx          # stats row, run history (Cancel on running entries), config card, 3-way header action (Running/Resume/Run now)
│   │   ├── chat/
│   │   │   ├── page.tsx              # message thread, mock conversation w/ tool-call states
│   │   │   ├── chat-input.tsx        # text-only input, send disabled until non-empty, non-functional
│   │   │   └── tool-status-card.tsx  # matches Live Execution Stream visual language (pulsing dot, mono detail text)
│   │   ├── connectors/
│   │   │   ├── mock-data.ts          # Connector type + mock array (connected/available states)
│   │   │   ├── connector-card.tsx    # bento card, status badge, destructive-on-hover "Disconnect"
│   │   │   └── page.tsx               # bento-grid layout, marketplace-style
│   │   ├── settings/
│   │   │   ├── actions.ts         # updateProfile — full_name, organization, address → user_metadata
│   │   │   ├── page.tsx            # Profile card (editable) + Account card (read-only, fixed "Verified" badge)
│   │   │   └── profile-form.tsx  # client form: name/org/address inputs, email read-only
│   │   ├── layout.tsx             # fetches user server-side, renders DashboardHeader + UserMenu, locked scroll wrapper
│   │   └── page.tsx                # Command Center — bento stat cards, Live Execution Stream, Scheduled Tasks (mock data)
│   ├── globals.css                 # theme vars, Geist font config, custom webkit scrollbar styling (zinc/OLED)
│   └── layout.tsx
├── components/
│   ├── ui/                          # shadcn primitives: button, card, input, label, sidebar, separator, avatar, dropdown-menu, textarea
│   ├── app-sidebar.tsx             # global nav (Command Center, Chat, Agents, Connectors), Recent Chats, workspace switcher (static mock)
│   └── dashboard/
│       ├── dashboard-header.tsx    # "use client", usePathname() — resolves title per route incl. dynamic /agents/[id]
│       ├── user-menu.tsx            # avatar dropdown: initials, name/email, Profile/Settings links, Log out
│       └── user-menu-actions.ts   # logout Server Action (separate file — required since user-menu.tsx is a Client Component)
├── lib/
│   └── supabase/
│       ├── client.ts                # createBrowserClient
│       ├── server.ts                 # createServerClient, cookie get/setAll
│       └── middleware.ts            # updateSession — session refresh, route guards (PROTECTED_ROUTES / AUTH_ONLY_ROUTES)
├── proxy.ts                    # root entry point, calls updateSession(), matcher excludes static assets
└── .env.local
```

## 3a. Chat-to-Agent Builder — Detailed Flow Spec

The deployment is not a single button click at the start of the conversation — it's a **progressive state machine inside the chat**, moving through four stages:

1. **Task Definition** — The user states their goal in natural language (e.g., _"Summarize my daily GitHub PRs"_). The AI identifies the underlying intent.
2. **Connector Validation** — The AI checks whether the required tools (e.g., GitHub, Slack) are already connected. If not, it renders an inline **Generative UI card directly in the chat** to connect them, rather than sending the user away to a separate settings page.
3. **Schedule Extraction** — The AI asks _"How often should I run this?"_ and parses the user's natural-language answer into a standard CRON expression.
4. **Confirmation** — The AI renders a final **"Draft Agent" UI card** in the chat, summarizing the compiled details, with a primary **"Deploy Agent"** button.

**Agent payload compiled before "Deploy" is clickable**

By the time the user can click Deploy, the AI must have assembled this exact JSON payload in the background:

| Field                  | Description                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `name` / `description` | Auto-generated by the AI from the task (e.g., "Daily PR Summarizer")                             |
| `system_prompt`        | The explicit instructions the agent follows when it wakes up in the background                   |
| `required_connectors`  | Array of tool IDs the agent has permission to use                                                |
| `target_configuration` | Specific metadata — e.g., the exact Slack channel ID to message, or the specific GitHub repo URL |
| `cron_schedule`        | Exact frequency to pass to Inngest (e.g., `0 9 * * *` for 9 AM daily)                            |

**Deployment behavior on clicking "Deploy" (inside the chat bubble)**

1. **UI state:** the button shifts to a pulsing **"Deploying..."** state.
2. **Database:** a Server Action fires, writing the finalized agent payload to the Supabase `agents` table with `status: "active"`.
3. **Infrastructure:** a webhook pings Inngest to register the new CRON schedule.
4. **Handoff:** the chat bubble updates to a success state, showing a **"View Agent Dashboard"** link that routes the user directly to `/agents/[id]`. The chat has done its job.

## 4. Conventions & Constraints

- **Architecture Rule:** Do not over-engineer. Use standard Next.js Server Actions for data mutations.
- **Server Action placement rule:** inline `"use server"` functions only work in **Server Components**. A Client Component must import a Server Action from a separate `"use server"`-file — cannot define one inline. (`user-menu.tsx` hit this exact build error; fixed via `user-menu-actions.ts`.)
- **File naming rule:** Server Action files must be named `actions.ts` (plural) to match the `import { x } from "./actions"` convention used across every page — a `action.ts`/`actions.ts` singular/plural mismatch caused a real "module not found" build error earlier in the project.
- **Route-aware header title (current approach):** `DashboardHeader` is a `"use client"` component using `usePathname()` to resolve titles instantly on navigation, including dynamic nested routes like `/agents/[id]`. This replaced an earlier server-side approach (reading a middleware-stamped `x-pathname` header inside the Server Component layout via `headers()`) — that version worked for top-level routes but didn't cleanly resolve dynamic segment titles on Next.js soft navigation, which is why it was replaced.
- **Scrollbar & Layout constraint:** the dashboard layout uses a rigid `h-screen overflow-hidden` wrapper on `<SidebarProvider>`, delegating `flex-1 min-h-0 overflow-y-auto` exclusively to `<main>`. This guarantees one single custom-styled scrollbar and eliminates a header-jitter/double-scrollbar bug encountered while building `/chat` and `/connectors`.
- **Custom scrollbar styling:** webkit scrollbar CSS added to `globals.css`, styled to match the zinc/OLED theme instead of default browser scrollbars — part of the "native-app feel" design goal.
- **Styling Rule (High Density):** `h-8` for nav/icon buttons, `h-9` for form inputs. Tight typography (`leading-tight`, `tracking-tight`).
- **Badge styling convention:** status pills use `rounded-full border border-{color}-500/20 bg-{color}-500/10 px-2 py-0.5 text-[11px] font-medium text-{color}-400` — reused across "Live", "Email verified", agent status (blue=active/running, zinc=idle, red=failed, amber=paused), and connector status badges.
- **Pulsing-dot convention:** an actively-running state gets a small dot with `animate-ping` overlay + solid inner dot — used in Command Center's Live Execution Stream, chat's tool-status cards, agent status badges, and now the chat's "Deploying..." button state.
- **Destructive hover convention:** actionable-but-dangerous items (e.g. a connected connector's "Disconnect" action) reveal a destructive-styled state only on hover, keeping the default resting state visually calm/neutral.
- **Agent state modeling:** an agent's "currently running" state (derived from `agent_runs` / run history) and its "enabled for future runs" state (a separate `status` field) are two _different_ dimensions — never conflate them into one visual state. Detail page branches the primary header action three ways: running → disabled "Running..." indicator; paused → single "Resume" button; otherwise → "Run now" as primary with Pause demoted to a small icon-only secondary action. Carries over almost as-is once wired to real DB state.
- **Non-functional placeholders left intentionally visible:** Google OAuth buttons (login/signup) and the Cancel button on a running run-history entry — styled and clickable-looking, not hidden or grayed out, but don't do anything yet. Deliberate honesty-over-hiding choice.
- **Theme decision:** a light-mode toggle (`next-themes`) was experimented with and **intentionally discarded** — strictly OLED dark mode is core to the product identity, not just a default.
- **Auth Rule:** All auth emails (signup confirm, password reset) route through `/auth/confirm` first to exchange the PKCE `code` param for a real session before landing on their final destination.
- **Profile data:** Organization/address live in Supabase's `user_metadata` JSON blob alongside `full_name` — no separate table needed yet.
- **Prohibited Actions:** no `src/` directory; no new npm/shadcn packages without explicit permission; no light-mode implementation; no fallback fonts (`--font-geist-sans` only).

## 5. Current State & Completed Tasks

_Date Stamped: September 2026_

**Completed Tasks:**

- [x] Project initialization, dashboard shell, Command Center bento grid, Supabase connection.
- [x] Full auth loop: signup (w/ duplicate-email detection), login, forgot-password, `/auth/confirm` PKCE exchange, reset-password, logout, route-guard middleware. Fixed a real prod bug where Supabase's Site URL had `/login` appended, causing reset links to misfire.
- [x] `/settings` — editable Full Name/Organization/Address, read-only Email/verification badge/join date.
- [x] `/chat` — message thread UI, tool-status cards (running/done), text-only input. Static mock data.
- [x] `/agents` — grid of 4 mock agents (active/idle/failed/paused) with "+ Deploy Agent".
- [x] `/agents/[id]` — stat cards, run history w/ Cancel placeholder, config card, 3-way header action state.
- [x] `/connectors` — bento-grid of `ConnectorCard` components with status badges and destructive-on-hover "Disconnect".
- [x] Dynamic header titles fixed via `DashboardHeader` Client Component (`usePathname()`), resolving the soft-navigation bug where titles didn't update on sidebar clicks — notably `/agents/[id]` now shows a correct dynamic title.
- [x] Native-app scroll layout locked — `h-screen overflow-hidden` on `SidebarProvider`, `overflow-y-auto` only on `<main>` — eliminating header jitter and double-scrollbar bugs.
- [x] Custom scrollbar CSS added to `globals.css`, matching zinc/OLED theme.
- [x] Finalized the "Chat-to-Agent Builder" product flow: Chat → Identify Connectors → Generative UI Setup → Schedule → Deploy — confirmed to map cleanly onto the free-tier stack. Full step-by-step spec, payload shape, and deployment behavior now documented in **Section 3a**.
- [x] Experimented with and intentionally discarded a light-mode theme toggle.
- [x] Workspace switcher (sidebar) intentionally left untouched — confirmed separate concern from user identity, no schema yet.

**Known Bugs / Broken:**

- None currently confirmed. UI foundation considered complete and stable, ready for real data.

**Known Limitations (deliberately deferred):**

- No real data anywhere yet — chat, agents, and connectors are all static mock arrays. Sending a chat message, running/pausing/canceling an agent, and connecting/disconnecting a connector are all non-functional placeholders pending DB schema + Inngest wiring.
- Supabase's default email rate limit — deferred connecting Resend until closer to real usage.
- Google OAuth buttons — non-functional placeholders.
- Email not editable from Settings.
- Address is a single free-text field, not structured (street/city/zip).

## 6. Next Task to Implement & Roadmap

**▶ IMMEDIATE NEXT TASK:**

- **Design the Supabase PostgreSQL schema:** draft SQL definitions for `users`, `workspaces`, `connectors`, `chat_sessions` (holds draft agent state), `agents`, and `agent_runs`.
  - `chat_sessions` needs to hold the in-progress draft payload described in Section 3a (name/description, system_prompt, required_connectors, target_configuration, cron_schedule) as it's incrementally built up across the conversation, before it graduates into a row in `agents` on Deploy.
  - `agents` needs a `status` column (active/idle/failed/paused — see Agent state modeling convention) distinct from any derived "currently running" state.
  - `agent_runs` needs to support the run history view already built in `/agents/[id]` (timestamps, outcome, cancel-in-progress).

**Upcoming Roadmap:**

1. Execute the Supabase SQL schema setup.
2. Wire real behavior: chat streaming (Vercel AI SDK `useChat`), Generative UI for inline connector tools, drafting an agent payload in the database.
3. Wire agent execution: agent run/pause/cancel actions, Inngest background job scheduling.
4. Wire live updates: Supabase Realtime for streaming execution logs back to the UI.
5. Build a real workspace switcher once the schema exists (consider a rounded-square badge to visually distinguish it from the circular personal-account avatar).
6. (Deferred) Connect Resend for auth emails before real-user usage.

## 7. Environment & Setup

```bash
npm install
npm run dev
```

**Required Environment Variables (`.env.local`):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Never expose the SERVICE_ROLE_KEY to NEXT_PUBLIC
```

**Required Supabase Dashboard Config:**

- Authentication → URL Configuration → **Site URL** must be the bare origin (`http://localhost:3000`), not a path like `/login` — a prior misconfiguration here caused reset-password links to silently redirect to the wrong page.
- Authentication → URL Configuration → Redirect URLs must include `http://localhost:3000/auth/confirm`.

**Required shadcn components installed so far:**

```bash
npx shadcn add avatar dropdown-menu textarea
```

## 8. Glossary

- **Pro Max UI:** High information density, subtle borders (`border-border/40`), blurred backgrounds (`bg-background/40 backdrop-blur-xl`), smooth hover states.
- **Bento Grid:** The Apple-style grid layout used on Command Center and Connectors.
- **Inngest:** Event-driven background job framework for background agent execution.
- **PKCE flow:** Auth code-exchange pattern used by `@supabase/ssr` — email links carry a `code` param requiring a server-side exchange before the destination page can assume a session exists.
- **Chat-to-Agent Builder:** The core product flow — chat defines the task, the AI identifies needed connectors, prompts inline setup via Generative UI if missing, determines schedule, then deploys the agent as a background job. Full stage-by-stage spec in Section 3a.
- **isRunning vs. status:** An agent's live "currently executing" state (derived from run history) is distinct from its "enabled/paused" state (a separate field) — never conflate these into a single visual state.
- **Workspace vs. user identity:** Sidebar workspace switcher (not yet functional) vs. top-right personal-account avatar dropdown — intentionally separate concerns.
