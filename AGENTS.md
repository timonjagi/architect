# AGENTS.md

## Project Context

**Architect** is an AI-powered system design and prompt optimization platform. It converts rough product ideas into actionable technical specifications, implementation roadmaps, and directory structures. We're upgrading it from a spec generator into an **execution operating system** — the place where generated architecture becomes shippable work.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS
- **Backend**: Supabase (auth + database)
- **Database**: Drizzle ORM (PostgreSQL)
- **AI**: Google Gemini API
- **State**: React Query (TanStack)
- **Toasts**: Sonner
- **Package Manager**: Bun (NOT npm or yarn)
- **Deploy**: Vercel

## Commands

```bash
bun install              # Install dependencies
bun run dev              # Start dev server
bun run build            # Production build
bun run lint             # ESLint
bunx tsc --noEmit        # Type check
bunx drizzle-kit generate # Generate migration
bunx drizzle-kit migrate  # Run migration
```

## Architecture

```
app/
├── api/
│   ├── projects/[id]/tasks/         # Import, list tasks
│   ├── projects/[id]/execution/     # Summary, today focus
│   └── tasks/[taskId]/              # Update, transition, block, unblock
├── components/
│   ├── DashboardView.tsx            # Main dashboard (config + tabs)
│   ├── ExecutionBoard.tsx           # Kanban task board
│   ├── LandingView.tsx              # Landing page
│   └── Toast.tsx                    # Sonner config
├── dashboard/page.tsx               # Dashboard route
├── login/                           # Login + server actions
├── signup/                          # Signup
└── auth/callback/                   # OAuth callback
lib/
├── db/
│   ├── schema.ts                    # All Drizzle tables + enums
│   └── index.ts                     # Lazy DB connection
├── supabase/
│   ├── server.ts                    # Server client (cookies)
│   ├── client.ts                    # Browser client (no-op proxy for build)
│   └── middleware.ts                # Session refresh
├── hooks/useProjects.ts             # React Query hooks for all entities
├── ai.ts                            # AI integration
├── gemini.ts                        # Gemini SDK wrapper
└── blueprints.ts                    # Module definitions
services/
└── taskService.ts                   # Task CRUD, import, blockers, focus
types.ts                             # All TypeScript interfaces
middleware.ts                        # Route protection
drizzle/                             # SQL migrations
```

## Database Schema

### Existing
- `projects` — User projects with config (framework, stack, blueprints)
- `project_specs` — Generated specs with version history
- `project_sources` — Uploaded context files

### Execution Mode (new)
- `project_tasks` — Tasks with status, priority, estimates, assignee
- `task_dependencies` — Task dependency graph
- `task_blockers` — Blocker tracking with type taxonomy
- `task_activity` — Audit log for all task events
- `execution_snapshots` — Weekly metrics (velocity, blocked count)

### Enums
- `task_status`: todo | in_progress | blocked | done
- `task_priority`: p0 | p1 | p2 | p3
- `blocker_type`: technical | scope | dependency | external
- `execution_mode`: simple | advanced
- `activity_event`: created | status_changed | blocked | unblocked | assigned | commented

## Conventions

- Always `await params` in Next.js 15 route handlers (it's a Promise).
- Use `bun` never `npm` or `yarn`.
- Client components: `'use client'` at top.
- Server actions: `'use server'` at top.
- Supabase browser client returns a no-op proxy when env vars are missing (build safety).
- Middleware guards Supabase calls behind env var checks.
- Toast notifications via `sonner`: `toast.success()`, `toast.error()`.
- React Query for server state. No global state library.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
DATABASE_URL
GEMINI_API_KEY
NEXT_PUBLIC_OPENROUTER_API_KEY
NEXT_PUBLIC_AI_MODEL
```

## Next Steps

### Immediate (P0)
1. **Today Focus tab** — Dedicated UI view for the top-3 focus tasks, not just the board column.
2. **Blocker aging indicator** — Show days blocked on task cards in the board.
3. **Spec → Task mapping refinement** — Test import with real generated specs, tune priority mapping.

### Phase 2 (Week 4–5)
4. **Dependency graph** — Visualize task dependencies, detect cycles, highlight critical path.
5. **Weekly review generator** — Auto-generate retro summary from activity snapshots.
6. **Execution snapshot cron** — Weekly metrics capture for velocity/predictability trends.

### Phase 3 (Week 6)
7. **Velocity chart** — Tasks completed per week over time.
8. **Blocked aging chart** — Average days tasks stay blocked.
9. **Predictability score** — Plan-vs-actual variance tracking.

### Phase 4 (Week 7–8)
10. **AI next-task recommendation** — Endpoint that suggests what to work on next with rationale.
11. **Task decomposition** — Break large tasks into 30–90 min subtasks.
12. **Daily standup summary** — AI-generated from activity log.

### P2
13. **Team features** — Assignees, comments, mentions.
14. **SLA nudges** — Stale task reminders.
15. **Multi-project workload view**.

## Known Issues / Debt
- `lib/db/index.ts` uses a Proxy for lazy init — clean up when ready to optimize.
- Middleware uses dynamic imports for Supabase (build-time workaround).
- No RLS policies on new execution tables yet — add before production.
- No permission checks on task endpoints — currently open to any authenticated user.
