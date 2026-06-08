import { db } from '@/lib/db';
import {
  projectTasks,
  taskDependencies,
  taskBlockers,
  taskActivity,
  projectSpecs,
} from '@/lib/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { createHash } from 'crypto';
import type {
  ExecutionTask,
  TaskStatus,
  TaskPriority,
  BlockerType,
  ActivityEvent,
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
    .select()
    .from(projectTasks)
    .where(and(...conditions))
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
