# PRD: Architect Execution Mode

## 1. Overview
Architect Execution Mode extends Architect beyond spec generation into day-to-day delivery management. It converts generated plans into structured work, supports execution workflows, and continuously feeds delivery signals back into planning.

## 2. Problem
Users can generate high-quality architecture and implementation plans, but still need to migrate that output to external task systems to execute. This creates friction, context loss, and low accountability.

## 3. Goals
- Turn generated specs into actionable tasks in one click.
- Help users prioritize daily work and reduce blocker time.
- Improve predictability with execution analytics.
- Use AI for execution support (decomposition, next action, unblock guidance).

## 4. Non-Goals (v1)
- Full enterprise program management (portfolio planning, budgeting).
- Complex cross-company permission hierarchies.
- Replacing git-based workflows.

## 5. Target Users
- Solo builders shipping MVPs.
- Small product engineering teams (2–10 people).
- Technical founders coordinating contractors.

## 6. User Stories
1. As a user, I can import tasks directly from a generated spec so I can start executing immediately.
2. As a user, I can see my top 3 focus tasks for today with rationale.
3. As a user, I can mark tasks blocked and capture blocker reasons.
4. As a user, I can view weekly progress and slippage risk.
5. As a team lead, I can see ownership and stale in-progress work.

## 7. Functional Requirements

### 7.1 Task Import
- Import tasks from latest or selected spec version.
- Support idempotent re-import with diff preview.
- Preserve manual task edits where possible.

### 7.2 Task Lifecycle
- States: `todo`, `in_progress`, `blocked`, `done`.
- Priority and effort fields.
- Dependency and blocker handling.

### 7.3 Execution Views
- Execution board by status.
- Today view with Top 3 and quick actions.
- Insights view with velocity and blocker aging.

### 7.4 AI Assistance
- Task breakdown suggestions.
- Next-best-task recommendation with explanation.
- Unblock playbook generation.

### 7.5 Weekly Review
- Auto-generated review summary from activity data.
- Carry-forward recommendations for next week.

## 8. Non-Functional Requirements
- p95 board load < 2s for projects up to 1,000 tasks.
- Idempotent task imports with no duplicate creation in retry scenarios.
- Immutable activity log for major task transitions.

## 9. Metrics
- Activation: `% specs imported into tasks within 24h`.
- Throughput: `tasks done per active project per week`.
- Reliability: `blocked task median age`.
- Retention: `4-week retention of execution-mode projects`.

## 10. Rollout
- Alpha: Internal dogfooding.
- Beta: Existing Architect users with feature flag.
- GA: All users with migration helper.

## 11. Open Questions
- Should Today Top 3 be fully auto-selected or user-pinned?
- How should imported tasks map to epics when spec structure is flat?
- What is the default behavior when dependencies form a cycle?
