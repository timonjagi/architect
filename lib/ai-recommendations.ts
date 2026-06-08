import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { getProjectTasks, getProjectDependencies, getExecutionSummary } from '@/services/taskService';
import { db } from '@/lib/db';
import { taskActivity } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

const openrouter = createOpenRouter({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '',
});

const recommendationSchema = z.object({
  taskId: z.string().describe('The ID of the task to recommend'),
  title: z.string().describe('The task title'),
  rationale: z.string().describe('Why this task should be worked on next'),
  estimatedMinutes: z.number().describe('Estimated time to complete'),
  blockers: z.array(z.string()).describe('Current blockers for this task'),
  prerequisites: z.array(z.string()).describe('What needs to be done before this task'),
});

export type TaskRecommendation = z.infer<typeof recommendationSchema>;

export async function aiRecommendNextTask(
  projectId: string
): Promise<TaskRecommendation> {
  const [tasks, dependencies, summary] = await Promise.all([
    getProjectTasks(projectId),
    getProjectDependencies(projectId),
    getExecutionSummary(projectId),
  ]);

  const taskIds = tasks.map((t) => t.id);
  let recentActivity: any[] = [];
  if (taskIds.length > 0) {
    recentActivity = await db
      .select()
      .from(taskActivity)
      .where(
        and(
          sql`${taskActivity.taskId} IN ${taskIds}`,
          sql`${taskActivity.createdAt} >= NOW() - INTERVAL '48 hours'`
        )
      )
      .orderBy(desc(taskActivity.createdAt))
      .limit(20);
  }

  const taskList = tasks
    .map(
      (t) =>
        `[${t.id}] ${t.title} | status=${t.status} | priority=${t.priority} | estimate=${t.estimateMinutes || '?'}min | desc=${(t.description || '').slice(0, 100)}`
    )
    .join('\n');

  const depList = dependencies
    .map((d) => `[${d.dependsOnTaskId}] blocks [${d.taskId}]`)
    .join('\n');

  const activityLog = recentActivity
    .map(
      (a) =>
        `${new Date(a.createdAt).toISOString()} | task=${a.taskId} | event=${a.eventType} | ${JSON.stringify(a.payload || {})}`
    )
    .join('\n');

  const prompt = `You are a project management AI. Analyze the following project and recommend the single best task to work on next.

CURRENT STATE:
- Total tasks: ${summary.total}
- Completed: ${summary.completed}
- In Progress: ${summary.inProgress}
- Blocked: ${summary.blocked}
- Todo: ${summary.todo}
- Completion rate: ${summary.completionRate}%

TASKS:
${taskList || 'No tasks yet.'}

DEPENDENCIES:
${depList || 'No dependencies.'}

RECENT ACTIVITY (last 48h):
${activityLog || 'No recent activity.'}

RULES:
1. If there are in_progress tasks, prioritize completing them first
2. If all in_progress are blocked, recommend the highest-priority unblocked todo task
3. Respect dependency order — don't recommend a task whose prerequisites aren't done
4. Consider priority (p0 > p1 > p2 > p3)
5. If no tasks exist, explain that the project needs tasks imported first
6. Pick the taskId from the list above exactly as written (including the [uuid] prefix)

Return your recommendation as JSON matching the schema.`;

  const { object } = await generateObject({
    model: openrouter(process.env.NEXT_PUBLIC_AI_MODEL || 'google/gemini-3-flash-preview'),
    schema: recommendationSchema,
    prompt,
  });

  return object;
}
