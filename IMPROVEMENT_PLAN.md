# Architect Improvement Plan (Execution Upgrade)

## Objective
Upgrade Architect from a spec generator into an **execution operating system** for software teams:

**Plan → Prioritize → Execute → Learn → Regenerate**

This update expands the previous plan with stronger product mechanics, operating cadences, and measurable rollout gates.

---

## Research Note
I attempted to review `https://github.com/timonjagi/get-shit-done` directly for feature-level inspiration, but network access to GitHub is blocked in this environment (`CONNECT tunnel failed, response 403`).

So this plan is grounded in:
1. Architect’s current repo capabilities (projects/specs/sources + generation flow).
2. Common execution patterns found in high-accountability productivity systems (focus lists, sprint flow, blocker handling, review loops).

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
> “The place where generated architecture becomes shippable work, and shipping data improves future architecture.”

---

## 2) Core Product Pillars

## Pillar A — Execution Model (P0)
Convert generated spec artifacts into trackable execution units.

### Features
- Task extraction from `implementation_plan` and `tasks`.
- Structured task model: status, priority, owner, estimate, due date.
- Dependency graph with cycle detection and critical-path highlighting.
- Work package grouping (Epic → Milestone → Task).

### Outcome
- No manual copy/paste from spec to issue tracker.

## Pillar B — Focus & Cadence (P0)
Create daily/weekly rhythms that drive completion.

### Features
- **Today Focus**: auto-suggest top 3 tasks by impact/urgency/dependencies.
- **Week Board**: backlog, in-progress, blocked, done.
- **Planning ritual**: Monday sprint setup template.
- **Review ritual**: Friday retrospective snapshot.

### Outcome
- Teams run work inside Architect instead of only planning there.

## Pillar C — Blocker Intelligence (P1)
Prevent silent stalls.

### Features
- Blocker states with reason taxonomy (tech, scope, dependency, external).
- Aging indicators for blocked tasks.
- Suggested unblock actions (split task, re-order dependencies, escalate).
- Risk score per project based on blocked critical path tasks.

### Outcome
- Faster recovery from execution deadlocks.

## Pillar D — AI Execution Coach (P1)
Use AI after planning, not only before.

### Features
- Task decomposition (large task → 30–90 minute steps).
- “What should I do next?” recommendation endpoint.
- Daily standup summary from activity log.
- Scope cut suggestions when deadlines slip.

### Outcome
- Better momentum and less planning overhead.

## Pillar E — Team Accountability (P2)
Enable small-team collaboration.

### Features
- Assignees, comments, mentions.
- Activity feed and ownership visibility.
- SLA-style nudges for stale in-progress work.

### Outcome
- Shared ownership around spec execution.

---

## 3) Proposed Data Model Additions

## New tables
1. `project_tasks`
   - `id`, `project_id`, `spec_id`, `epic_id`, `title`, `description`
   - `status` (`todo|in_progress|blocked|done`)
   - `priority` (`p0|p1|p2|p3`)
   - `estimate_minutes`, `actual_minutes`
   - `assignee_id`, `due_date`, `created_at`, `updated_at`
2. `task_dependencies`
   - `id`, `task_id`, `depends_on_task_id`, `dependency_type`
3. `task_blockers`
   - `id`, `task_id`, `type`, `details`, `created_by`, `resolved_at`
4. `task_activity`
   - `id`, `task_id`, `actor_id`, `event_type`, `payload`, `created_at`
5. `execution_snapshots`
   - `id`, `project_id`, `snapshot_date`, `velocity`, `blocked_count`, `predictability_score`

## Extended current entities
- Add `current_execution_mode` and `execution_settings` to `projects`.
- Link `project_specs` to imported tasks via `spec_id`.

---

## 4) API Plan

## New endpoints
- `POST /api/projects/[id]/tasks/import-from-spec`
- `GET /api/projects/[id]/tasks`
- `PATCH /api/tasks/[taskId]`
- `POST /api/tasks/[taskId]/transition`
- `POST /api/tasks/[taskId]/block`
- `POST /api/tasks/[taskId]/unblock`
- `GET /api/projects/[id]/execution/summary`
- `GET /api/projects/[id]/execution/today`
- `POST /api/projects/[id]/execution/weekly-review`

## Guardrails
- Idempotent import from spec version.
- Optimistic concurrency to prevent overwrite collisions.
- Permission checks by project membership.

---

## 5) UX Changes

## New dashboard tabs
1. **Execution**
   - Kanban + compact list views.
   - Dependency and blocker badges.
2. **Today**
   - Focus 3 list.
   - Start/stop timer and completion quick actions.
3. **Insights**
   - Velocity, blocked aging, predictability trend.
4. **Review**
   - Weekly reflection generated from activity history.

## Experience principles
- Single-click state transitions.
- Keyboard shortcuts for fast task operations.
- AI suggestions are assistive and always editable.

---

## 6) Rollout Plan (8 Weeks)

## Phase 0 (Week 1): Discovery & Contracts
- Lock task schema and API contracts.
- Define mapping rules from generated specs to tasks.

## Phase 1 (Week 2–3): Task Engine
- Migrations + CRUD + import-from-spec pipeline.
- Basic task list integrated into existing project flow.

## Phase 2 (Week 4–5): Execution UX
- Execution + Today tabs.
- Blocker capture and dependency management.

## Phase 3 (Week 6): Insights & Reviews
- Velocity and blocker aging dashboards.
- Weekly review generation and snapshot persistence.

## Phase 4 (Week 7–8): AI Coach
- Next-best-task recommendation.
- Task decomposition and slip mitigation suggestions.

---

## 7) KPIs & Instrumentation

## Activation
- % of projects that move from generated spec to at least 1 active task.

## Engagement
- Weekly active execution projects.
- Median tasks completed per active project/week.

## Quality
- Blocker median age.
- Plan-vs-actual variance.
- Predictability score trend.

## Retention
- 4-week retention for users who activate execution mode.

---

## 8) Risks & Mitigations

1. **Too much complexity for solo users**
   - Start with “Simple mode” defaults and reveal advanced controls progressively.
2. **Noisy task imports**
   - Apply dedupe and merge heuristics; preview import before commit.
3. **AI recommendations lose trust**
   - Show rationale for each suggestion and keep one-click override.
4. **Data quality drift**
   - Add required minimal fields for in-progress tasks and stale-task reminders.

---

## 9) Immediate Backlog (Top 10)

1. Create `project_tasks`, `task_dependencies`, `task_blockers`, `task_activity` migrations.
2. Build idempotent `import-from-spec` service keyed by `spec_id` + hash.
3. Add task transition endpoint with audit logging.
4. Add Execution tab MVP with status columns.
5. Add Today tab MVP with deterministic top-3 heuristic.
6. Add blocker modal and blocker age indicator.
7. Add velocity and blocked aging charts.
8. Add weekly review generator using activity snapshots.
9. Add AI next-task recommendation endpoint + rationale.
10. Add product analytics events for execution funnel.
