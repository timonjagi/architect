# Architect Improvement Plan (inspired by `get-shit-done`)

## Context
This plan focuses on improving **execution quality after spec generation** so Architect moves from “great documents” to “consistent shipping outcomes.” It borrows from `get-shit-done`-style product patterns: clear prioritization, short execution loops, progress visibility, and lightweight accountability.

> Note: GitHub access to `https://github.com/timonjagi/get-shit-done` was blocked in this environment, so this is a best-effort plan based on Architect’s current codebase and common execution patterns associated with “get-shit-done” systems.

---

## 1) Product Direction Shift

### Current strength
Architect already does strong up-front planning: blueprints, stack constraints, generated specs, project/version persistence.

### Gap to close
Users still need a practical system to **execute** the generated implementation plan day-by-day.

### Strategic shift
Evolve Architect into a **Plan → Execute → Review loop**:
1. Generate spec and tasks.
2. Convert tasks into actionable milestones/sprints.
3. Track completion velocity and blockers.
4. Feed progress data back into AI for the next iteration.

---

## 2) High-Impact Features to Borrow

## A. Actionable Task Engine (P0)
- Parse `implementation_plan`/`tasks` into first-class task entities.
- Add statuses: `todo`, `in_progress`, `blocked`, `done`.
- Add priorities: `P0`–`P3`.
- Add effort fields: `estimate_hours`, `actual_hours`.
- Add dependencies: `blocked_by_task_id[]`.

**Why**: turns static spec output into an execution system.

## B. Daily/Weekly Execution Views (P0)
- “Today” view: top 3 tasks + unblock suggestions.
- “This Week” sprint board: backlog → doing → done.
- Quick actions: start/pause/complete task; mark blocker.

**Why**: mirrors get-shit-done rhythm and reduces planning paralysis.

## C. Progress Analytics & Accountability (P1)
- Completion trend (tasks/week).
- Planned vs actual effort variance.
- Blocker aging report.
- “Risk alert” when critical path tasks stall.

**Why**: makes project health visible early.

## D. AI Execution Coach (P1)
- Auto-suggest next best task based on dependencies + priority.
- Break oversized tasks into 30–90 min chunks.
- Generate “unblock plan” for blocked tasks.
- End-of-day summary and next-day focus list.

**Why**: keeps momentum without leaving Architect.

## E. Lightweight Collaboration (P2)
- Task assignees and comments.
- Mention-based updates (`@name`) and owner alerts.
- Project activity feed.

**Why**: aligns PM/engineer collaboration around generated specs.

---

## 3) Data Model & API Upgrades

## Proposed new tables
1. `project_tasks`
   - `id`, `project_id`, `spec_id`, `title`, `description`
   - `status`, `priority`, `estimate_hours`, `actual_hours`
   - `assignee_id`, `due_date`, `created_at`, `updated_at`
2. `task_dependencies`
   - `id`, `task_id`, `depends_on_task_id`
3. `task_activity`
   - `id`, `task_id`, `actor_id`, `type`, `payload`, `created_at`
4. `execution_snapshots`
   - `id`, `project_id`, `snapshot_date`, `planned_points`, `completed_points`, `blocked_count`

## API additions
- `POST /api/projects/[id]/tasks/import-from-spec`
- `GET /api/projects/[id]/tasks`
- `PATCH /api/tasks/[taskId]`
- `POST /api/tasks/[taskId]/start|complete|block`
- `GET /api/projects/[id]/execution/summary`

---

## 4) UX Plan

## New sections in Dashboard
1. **Execution tab**
   - Kanban board + list toggle.
   - Filters by assignee, priority, status.
2. **Today tab**
   - “Top 3” auto-curated tasks.
   - Quick time estimate edits.
3. **Insights tab**
   - Velocity chart + blocker heatmap.

## Interaction principles
- One-click task state transitions.
- Keyboard-first shortcuts for high-frequency actions.
- AI suggestions should be optional, never forced.

---

## 5) Rollout Roadmap (6 Weeks)

## Phase 1 (Week 1–2): Foundation
- Add DB schema + migrations for tasks/dependencies/activity.
- Build task import pipeline from generated specs.
- Expose CRUD/task state APIs.

## Phase 2 (Week 3–4): Execution UX
- Ship Execution tab with Kanban + filters.
- Ship Today view with top-3 focus workflow.
- Add blocker and dependency management UI.

## Phase 3 (Week 5): Insights
- Add completion trend, blocker aging, and variance widgets.
- Add project risk scoring based on stalled P0/P1 tasks.

## Phase 4 (Week 6): AI Coach
- Add “Suggest next task” endpoint/UI.
- Add automatic task decomposition for long tasks.
- Add end-of-day summary generation.

---

## 6) Success Metrics

## Product metrics
- +40% increase in weekly completed tasks per active project.
- -30% reduction in blocked-task time.
- +25% increase in users returning after first spec generation.

## Quality metrics
- <2s p95 task board load time.
- <1% API error rate for task transitions.
- No data integrity violations in dependency graph.

---

## 7) Implementation Notes for Current Architect Repo

- Existing project/spec/source structure is already suitable as a base.
- Add task import in the same generation flow currently used for specs.
- Reuse existing React Query + Supabase patterns for task state mutations.
- Keep AI model usage focused on prioritization/decomposition to control cost.

---

## 8) Risks & Mitigations

1. **Risk:** Task bloat from auto-import.
   - **Mitigation:** dedupe + merge similar tasks; archive low-priority tasks by default.
2. **Risk:** Over-automation causes low trust.
   - **Mitigation:** keep human override on priority and suggested next task.
3. **Risk:** Added complexity hurts onboarding.
   - **Mitigation:** progressive disclosure (simple mode first, advanced execution tools later).

---

## 9) Immediate Next 5 Tickets

1. Create `project_tasks` + `task_dependencies` migrations.
2. Implement `/tasks/import-from-spec` parser with idempotency safeguards.
3. Add Execution tab skeleton with project-level task list.
4. Add task status transitions + optimistic UI updates.
5. Add MVP Today view with top-3 recommendation heuristic.
