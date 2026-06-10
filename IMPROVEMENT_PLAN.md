# Architect Improvement Plan (Execution Upgrade)

## Objective
Upgrade Architect from a spec generator into an **execution operating system** for software teams:

**Plan → Prioritize → Execute → Learn → Regenerate**

This update expands the previous plan with stronger product mechanics, operating cadences, and measurable rollout gates.

---

## Progress

### Phase 0 (Week 1): Discovery & Contracts — ✅ Complete
- Locked task schema and API contracts.
- Defined mapping rules from generated specs to tasks.
- Created Drizzle schema with 5 new tables + 5 enums.
- Migrated to Supabase (project `psleaiqtmfgmjvytazwq`).

### Phase 1 (Week 2–3): Task Engine — ✅ Complete
- **Task Service** (`services/taskService.ts`):
  - Idempotent `importTasksFromSpec` keyed by `spec_id` + hash.
  - `getProjectTasks`, `getTaskById`, `updateTask`, `transitionTask`.
  - `blockTask`, `unblockTask` with activity logging.
  - `getTodayFocus` (in-progress → todo by priority).
  - `getExecutionSummary` (counts, completion rate, avg blocker age).
- **API Routes** (8 endpoints):
  - `POST /api/projects/[id]/tasks/import`
  - `GET /api/projects/[id]/tasks`
  - `PATCH /api/tasks/[taskId]`
  - `POST /api/tasks/[taskId]/transition`
  - `POST /api/tasks/[taskId]/block`
  - `POST /api/tasks/[taskId]/unblock`
  - `GET /api/projects/[id]/execution/summary`
  - `GET /api/projects/[id]/execution/today`
- **ExecutionBoard UI** (`app/components/ExecutionBoard.tsx`):
  - Kanban columns (Todo, In Progress, Blocked, Done).
  - Task cards with priority badges, quick status transitions.
  - Blocker modal with type selection and details.
  - Inline expand for estimates and status switching.

### Bug Fixes
- Next.js 15 async `params` in all API routes.
- Supabase env var guards in middleware and browser client.
- Vercel build: lazy DB init, force-dynamic dashboard, no-op proxy for missing env vars during prerender.
- Browser client key name mismatch (`PUBLISHABLE_DEFAULT_KEY` → `PUBLISHABLE_KEY`).

### UX Improvements
- Toast notifications (sonner) for auth errors, file uploads, spec generation.
- Readable auth error messages (invalid credentials, already registered, etc.).

---

## Not Started

### Phase 2 (Week 4–5): Execution UX
- [ ] Today Focus tab MVP (dedicated view, not just board column).
- [ ] Blocker aging indicator on task cards.
- [ ] Dependency graph visualization (cycle detection, critical path).
- [ ] Weekly review generation from activity snapshots.

### Phase 3 (Week 6): Insights & Reviews
- [ ] Velocity chart (tasks completed per week).
- [ ] Blocked aging chart.
- [ ] Predictability score trend.
- [ ] Execution snapshot persistence (cron or weekly trigger).

### Phase 4 (Week 7–8): AI Coach
- [ ] AI next-best-task recommendation endpoint + rationale.
- [ ] Task decomposition (large task → 30–90 min steps).
- [ ] Daily standup summary from activity log.
- [ ] Scope cut suggestions when deadlines slip.

### P2 — Team Accountability
- [ ] Assignees, comments, mentions.
- [ ] Activity feed and ownership visibility.
- [ ] SLA-style nudges for stale in-progress work.

---

## 1) Product Strategy Shift

### Current Architect value
- Great at converting rough ideas into structured technical specs.
- Strong blueprint and stack configuration model.
- Persistent project/spec history.

### Missing value
- Teams still need external tools to actually run the work.

### New value proposition
Architect should become:
> "The place where generated architecture becomes shippable work, and shipping data improves future architecture."

---

## 2) Core Product Pillars

## Pillar A — Execution Model (P0) ✅
Convert generated spec artifacts into trackable execution units.

### Features
- [x] Task extraction from `implementation_plan` and `tasks`.
- [x] Structured task model: status, priority, owner, estimate, due date.
- [ ] Dependency graph with cycle detection and critical-path highlighting.
- [ ] Work package grouping (Epic → Milestone → Task).

## Pillar B — Focus & Cadence (P0) 🟡
Create daily/weekly rhythms that drive completion.

### Features
- [x] **Today Focus**: auto-suggest top 3 tasks by impact/urgency/dependencies.
- [x] **Week Board**: backlog, in-progress, blocked, done.
- [ ] **Planning ritual**: Monday sprint setup template.
- [ ] **Review ritual**: Friday retrospective snapshot.

## Pillar C — Blocker Intelligence (P1) 🟡
Prevent silent stalls.

### Features
- [x] Blocker states with reason taxonomy (tech, scope, dependency, external).
- [ ] Aging indicators for blocked tasks.
- [ ] Suggested unblock actions (split task, re-order dependencies, escalate).
- [ ] Risk score per project based on blocked critical path tasks.

## Pillar D — AI Execution Coach (P1) ❌
Use AI after planning, not only before.

## Pillar E — Team Accountability (P2) ❌
Enable small-team collaboration.

---

## 3) Data Model — ✅ Complete

### New tables (in Supabase)
1. `project_tasks` — 14 columns, FK to projects + project_specs
2. `task_dependencies` — 4 columns, self-referencing FK
3. `task_blockers` — 7 columns, blocker type enum
4. `task_activity` — 6 columns, activity event enum
5. `execution_snapshots` — 8 columns, metrics snapshot

### Extended entities
- `projects` + `current_execution_mode` (simple/advanced) + `execution_settings` (jsonb)

### Enums
- `task_status` (todo, in_progress, blocked, done)
- `task_priority` (p0, p1, p2, p3)
- `blocker_type` (technical, scope, dependency, external)
- `execution_mode` (simple, advanced)
- `activity_event` (created, status_changed, blocked, unblocked, assigned, commented)

---

## 4) API Plan — ✅ Complete

All endpoints built and typed. Next.js 15 async params handled.

---

## 5) UX Changes — 🟡 Partial

1. **Execution** ✅ — Kanban board with status columns, blocker modal.
2. **Today** 🟡 — Focus heuristic exists in API, no dedicated UI tab yet.
3. **Insights** ❌
4. **Review** ❌

---

## 6) KPIs & Instrumentation — ❌ Not started

---

## 7) Risks & Mitigations

1. **Too much complexity for solo users** — Start with "Simple mode" defaults.
2. **Noisy task imports** — Idempotent import with dedupe.
3. **AI recommendations lose trust** — Show rationale, one-click override.
4. **Data quality drift** — Required fields for in-progress tasks.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS
- **Backend**: Supabase (auth + database)
- **Database**: Drizzle ORM (PostgreSQL)
- **AI**: Google Gemini API
- **State**: React Query (TanStack)
- **Toasts**: Sonner
- **Package Manager**: Bun
- **Deploy**: Vercel

## Key Files

```
architect/
├── app/
│   ├── api/projects/[id]/tasks/      # Task CRUD + import
│   ├── api/projects/[id]/execution/   # Summary + today focus
│   ├── api/tasks/[taskId]/            # Update, transition, block, unblock
│   ├── components/
│   │   ├── DashboardView.tsx          # Main dashboard with tabs
│   │   ├── ExecutionBoard.tsx         # Kanban task board
│   │   └── Toast.tsx                  # Sonner config
│   └── dashboard/page.tsx
├── lib/
│   ├── db/schema.ts                   # Drizzle schema (all tables + enums)
│   ├── supabase/                      # Server, client, middleware
│   └── hooks/useProjects.ts           # React Query hooks
├── services/taskService.ts            # Task business logic
├── types.ts                           # TypeScript interfaces
└── drizzle/                           # Migrations
```
