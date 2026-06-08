import { db } from '@/lib/db';
import {
  projectTasks,
  taskDependencies,
  taskBlockers,
  taskActivity,
  projectSpecs,
  executionSnapshots,
} from '@/lib/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { createHash } from 'crypto';
import type {
  ExecutionTask,
  TaskStatus,
  TaskPriority,
  BlockerType,
  ActivityEvent,
  TaskDependency,
} from '@/types';

function generateImportHash(specId: string, projectId: string): string {
  return createHash('sha256').update(`${specId}:${projectId}`).digest('hex');
}

interface SpecTask {
  title: string;
  description?: string;
  priority?: string;
  estimate_minutes?: number;
  dependencies?: string[];
  epic_id?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  tasks: ExecutionTask[];
}

export async function importTasksFromSpec(
  projectId: string,
  specId: string,
  tasks: SpecTask[]
): Promise<ImportResult> {
  const importHash = generateImportHash(specId, projectId);

  const existingTasks = await db
    .select()
    .from(projectTasks)
    .where(
      and(
        eq(projectTasks.projectId, projectId),
        eq(projectTasks.specId, specId)
      )
    );

  if (existingTasks.length > 0) {
    return {
      imported: 0,
      skipped: existingTasks.length,
      tasks: existingTasks as ExecutionTask[],
    };
  }

  const insertedTasks: ExecutionTask[] = [];

  for (const task of tasks) {
    const priorityMap: Record<string, TaskPriority> = {
      high: 'p0',
      medium: 'p1',
      low: 'p2',
      p0: 'p0',
      p1: 'p1',
      p2: 'p2',
      p3: 'p3',
    };

    const [inserted] = await db
      .insert(projectTasks)
      .values({
        projectId,
        specId,
        epicId: task.epic_id || null,
        title: task.title,
        description: task.description || null,
        status: 'todo',
        priority: priorityMap[task.priority || 'medium'] || 'p1',
        estimateMinutes: task.estimate_minutes || null,
      })
      .returning();

    insertedTasks.push(inserted as ExecutionTask);

    await db.insert(taskActivity).values({
      taskId: inserted.id,
      eventType: 'created' as ActivityEvent,
      payload: { source: 'spec_import', specId, importHash },
    });
  }

  return {
    imported: insertedTasks.length,
    skipped: 0,
    tasks: insertedTasks,
  };
}

export async function getProjectTasks(
  projectId: string,
  status?: TaskStatus
): Promise<ExecutionTask[]> {
  const conditions = [eq(projectTasks.projectId, projectId)];
  if (status) {
    conditions.push(eq(projectTasks.status, status));
  }

  return db
    .select({
      id: projectTasks.id,
      projectId: projectTasks.projectId,
      specId: projectTasks.specId,
      epicId: projectTasks.epicId,
      title: projectTasks.title,
      description: projectTasks.description,
      status: projectTasks.status,
      priority: projectTasks.priority,
      estimateMinutes: projectTasks.estimateMinutes,
      actualMinutes: projectTasks.actualMinutes,
      assigneeId: projectTasks.assigneeId,
      dueDate: projectTasks.dueDate,
      blockedSince: sql<Date | null>`MAX(CASE WHEN ${taskBlockers.resolvedAt} IS NULL THEN ${taskBlockers.createdAt} END)`,
      createdAt: projectTasks.createdAt,
      updatedAt: projectTasks.updatedAt,
    })
    .from(projectTasks)
    .leftJoin(taskBlockers, eq(projectTasks.id, taskBlockers.taskId))
    .where(and(...conditions))
    .groupBy(projectTasks.id)
    .orderBy(desc(projectTasks.createdAt)) as Promise<ExecutionTask[]>;
}

export async function getTaskById(taskId: string): Promise<ExecutionTask | null> {
  const [task] = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.id, taskId))
    .limit(1);

  return (task as ExecutionTask) || null;
}

export async function updateTask(
  taskId: string,
  updates: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    estimateMinutes: number;
    actualMinutes: number;
    assigneeId: string;
    dueDate: Date;
  }>
): Promise<ExecutionTask | null> {
  const [updated] = await db
    .update(projectTasks)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projectTasks.id, taskId))
    .returning();

  if (updated && updates.status) {
    await db.insert(taskActivity).values({
      taskId,
      eventType: 'status_changed' as ActivityEvent,
      payload: { newStatus: updates.status },
    });
  }

  return (updated as ExecutionTask) || null;
}

export async function transitionTask(
  taskId: string,
  newStatus: TaskStatus,
  actorId?: string
): Promise<ExecutionTask | null> {
  const task = await getTaskById(taskId);
  if (!task) return null;

  const [updated] = await db
    .update(projectTasks)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(projectTasks.id, taskId))
    .returning();

  const eventType: ActivityEvent =
    newStatus === 'blocked' ? 'blocked' : 'status_changed';

  await db.insert(taskActivity).values({
    taskId,
    actorId: actorId || null,
    eventType,
    payload: { previousStatus: task.status, newStatus },
  });

  return (updated as ExecutionTask) || null;
}

export async function blockTask(
  taskId: string,
  blockerType: BlockerType,
  details: string,
  createdBy?: string
): Promise<void> {
  await db.insert(taskBlockers).values({
    taskId,
    type: blockerType,
    details,
    createdBy: createdBy || null,
  });

  await transitionTask(taskId, 'blocked', createdBy);

  await db.insert(taskActivity).values({
    taskId,
    actorId: createdBy || null,
    eventType: 'blocked',
    payload: { blockerType, details },
  });
}

export async function unblockTask(taskId: string): Promise<void> {
  await db
    .update(taskBlockers)
    .set({ resolvedAt: new Date() })
    .where(
      and(
        eq(taskBlockers.taskId, taskId),
        sql`${taskBlockers.resolvedAt} IS NULL`
      )
    );

  await transitionTask(taskId, 'in_progress');

  await db.insert(taskActivity).values({
    taskId,
    eventType: 'unblocked',
    payload: {},
  });
}

export async function getTaskActivity(taskId: string) {
  return db
    .select()
    .from(taskActivity)
    .where(eq(taskActivity.taskId, taskId))
    .orderBy(desc(taskActivity.createdAt));
}

export async function getTodayFocus(
  projectId: string,
  limit: number = 3
): Promise<ExecutionTask[]> {
  const blockedTasks = await db
    .select()
    .from(projectTasks)
    .where(
      and(
        eq(projectTasks.projectId, projectId),
        eq(projectTasks.status, 'in_progress')
      )
    )
    .limit(limit);

  if (blockedTasks.length >= limit) {
    return blockedTasks as ExecutionTask[];
  }

  const remaining = limit - blockedTasks.length;
  const todoTasks = await db
    .select()
    .from(projectTasks)
    .where(
      and(
        eq(projectTasks.projectId, projectId),
        eq(projectTasks.status, 'todo')
      )
    )
    .orderBy(
      sql`CASE ${projectTasks.priority} WHEN 'p0' THEN 0 WHEN 'p1' THEN 1 WHEN 'p2' THEN 2 ELSE 3 END`
    )
    .limit(remaining);

  return [...blockedTasks, ...todoTasks] as ExecutionTask[];
}

export async function getExecutionSummary(projectId: string) {
  const allTasks = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId));

  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === 'done').length;
  const inProgress = allTasks.filter((t) => t.status === 'in_progress').length;
  const blocked = allTasks.filter((t) => t.status === 'blocked').length;
  const todo = allTasks.filter((t) => t.status === 'todo').length;

  const blockedTasks = allTasks.filter((t) => t.status === 'blocked');
  let avgBlockerAge = 0;
  if (blockedTasks.length > 0) {
    const now = Date.now();
    const ages = blockedTasks.map((t) => {
      const created = new Date(t.createdAt).getTime();
      return (now - created) / (1000 * 60 * 60 * 24);
    });
    avgBlockerAge = ages.reduce((a, b) => a + b, 0) / ages.length;
  }

  return {
    total,
    completed,
    inProgress,
    blocked,
    todo,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgBlockerAgeDays: Math.round(avgBlockerAge * 10) / 10,
  };
}

export async function getProjectDependencies(
  projectId: string
): Promise<TaskDependency[]> {
  const tasks = await db
    .select({ id: projectTasks.id })
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId));
  const taskIds = tasks.map((t) => t.id);

  if (taskIds.length === 0) return [];

  return db
    .select()
    .from(taskDependencies)
    .where(inArray(taskDependencies.taskId, taskIds)) as Promise<TaskDependency[]>;
}

export async function addDependency(
  taskId: string,
  dependsOnTaskId: string
): Promise<TaskDependency | null> {
  const existing = await db
    .select()
    .from(taskDependencies)
    .where(
      and(
        eq(taskDependencies.taskId, taskId),
        eq(taskDependencies.dependsOnTaskId, dependsOnTaskId)
      )
    )
    .limit(1);

  if (existing.length > 0) return existing[0] as TaskDependency;

  const [inserted] = await db
    .insert(taskDependencies)
    .values({ taskId, dependsOnTaskId })
    .returning();

  return (inserted as TaskDependency) || null;
}

export async function removeDependency(
  dependencyId: string
): Promise<boolean> {
  const result = await db
    .delete(taskDependencies)
    .where(eq(taskDependencies.id, dependencyId))
    .returning();
  return result.length > 0;
}

export interface WeeklyReview {
  period: { from: Date; to: Date };
  activity: {
    created: number;
    completed: number;
    blocked: number;
    unblocked: number;
    total: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    todo: number;
    completionRate: number;
  };
  velocity: number[];
  highlights: string[];
}

export async function getWeeklyReview(
  projectId: string,
  weeksBack: number = 0
): Promise<WeeklyReview> {
  const now = new Date();
  const to = new Date(now);
  to.setDate(to.getDate() - weeksBack * 7);
  const from = new Date(to);
  from.setDate(from.getDate() - 7);

  const projectTaskIds = (
    await db
      .select({ id: projectTasks.id })
      .from(projectTasks)
      .where(eq(projectTasks.projectId, projectId))
  ).map((t) => t.id);

  let activityRows: any[] = [];
  if (projectTaskIds.length > 0) {
    activityRows = await db
      .select()
      .from(taskActivity)
      .where(
        and(
          inArray(taskActivity.taskId, projectTaskIds),
          sql`${taskActivity.createdAt} >= ${from}`,
          sql`${taskActivity.createdAt} <= ${to}`
        )
      );
  }

  const created = activityRows.filter((a) => a.eventType === 'created').length;
  const completed = activityRows.filter((a) => a.eventType === 'status_changed' && a.payload?.newStatus === 'done').length;
  const blocked = activityRows.filter((a) => a.eventType === 'blocked').length;
  const unblocked = activityRows.filter((a) => a.eventType === 'unblocked').length;

  const allTasks = projectTaskIds.length > 0
    ? await db
        .select()
        .from(projectTasks)
        .where(eq(projectTasks.projectId, projectId))
    : [];

  const total = allTasks.length;
  const doneCount = allTasks.filter((t) => t.status === 'done').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'in_progress').length;
  const blockedCount = allTasks.filter((t) => t.status === 'blocked').length;
  const todoCount = allTasks.filter((t) => t.status === 'todo').length;

  const snapshots = await db
    .select()
    .from(executionSnapshots)
    .where(
      and(
        eq(executionSnapshots.projectId, projectId),
        sql`${executionSnapshots.snapshotDate} >= ${from}`,
        sql`${executionSnapshots.snapshotDate} <= ${to}`
      )
    )
    .orderBy(executionSnapshots.snapshotDate);

  const velocity = snapshots
    .map((s) => s.velocity ?? 0)
    .filter((v) => v > 0);

  const highlights: string[] = [];
  if (completed > 0) highlights.push(`${completed} task${completed > 1 ? 's' : ''} completed`);
  if (blocked > 0) highlights.push(`${blocked} task${blocked > 1 ? 's' : ''} blocked`);
  if (unblocked > 0) highlights.push(`${unblocked} blocker${unblocked > 1 ? 's' : ''} resolved`);
  if (created > 0) highlights.push(`${created} new task${created > 1 ? 's' : ''} added`);
  if (total > 0 && doneCount === total) highlights.push('All tasks completed!');
  if (blockedCount === 0 && total > 0) highlights.push('No blockers — full velocity');

  return {
    period: { from, to },
    activity: { created, completed, blocked, unblocked, total: activityRows.length },
    tasks: {
      total,
      completed: doneCount,
      inProgress: inProgressCount,
      blocked: blockedCount,
      todo: todoCount,
      completionRate: total > 0 ? Math.round((doneCount / total) * 100) : 0,
    },
    velocity,
    highlights,
  };
}

export async function captureSnapshot(
  projectId: string
): Promise<void> {
  const allTasks = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId));

  const total = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'done').length;
  const blockedCount = allTasks.filter((t) => t.status === 'blocked').length;

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const recentCompletions = allTasks.filter(
    (t) =>
      t.status === 'done' &&
      new Date(t.updatedAt) >= lastWeek
  ).length;

  const prevSnapshots = await db
    .select()
    .from(executionSnapshots)
    .where(eq(executionSnapshots.projectId, projectId))
    .orderBy(desc(executionSnapshots.snapshotDate))
    .limit(4);

  let predictabilityScore: number | null = null;
  if (prevSnapshots.length >= 2) {
    const recentVelocity = prevSnapshots.map((s) => s.velocity ?? 0);
    const avg = recentVelocity.reduce((a, b) => a + b, 0) / recentVelocity.length;
    const variance =
      recentVelocity.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) /
      recentVelocity.length;
    const stdDev = Math.sqrt(variance);
    predictabilityScore = Math.round(Math.max(0, 100 - stdDev * 10));
  }

  await db.insert(executionSnapshots).values({
    projectId,
    velocity: recentCompletions,
    blockedCount,
    totalTasks: total,
    completedTasks,
    predictabilityScore,
  });
}

export async function getSnapshots(
  projectId: string,
  limit: number = 12
) {
  return db
    .select()
    .from(executionSnapshots)
    .where(eq(executionSnapshots.projectId, projectId))
    .orderBy(desc(executionSnapshots.snapshotDate))
    .limit(limit);
}
