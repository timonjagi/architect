import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { getProjectTasks, getExecutionSummary } from '@/services/taskService';
import { db } from '@/lib/db';
import { taskActivity } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

const openrouter = createOpenRouter({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '',
});

const standupSchema = z.object({
  yesterday: z.array(z.string()).describe('Tasks completed or progressed yesterday'),
  today: z.array(z.string()).describe('Recommended tasks to work on today'),
  blockers: z.array(z.string()).describe('Current blockers preventing progress'),
  summary: z.string().describe('One-line executive summary of project status'),
});

export type DailyStandup = z.infer<typeof standupSchema>;

export async function aiGenerateStandup(
  projectId: string
): Promise<DailyStandup> {
  const [tasks, summary] = await Promise.all([
    getProjectTasks(projectId),
    getExecutionSummary(projectId),
  ]);

  const taskIds = tasks.map((t) => t.id);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let recentActivity: any[] = [];
  if (taskIds.length > 0) {
    recentActivity = await db
      .select()
      .from(taskActivity)
      .where(
        and(
          sql`${taskActivity.taskId} IN ${taskIds}`,
          sql`${taskActivity.createdAt} >= ${yesterday}`
        )
      )
      .orderBy(desc(taskActivity.createdAt));
  }

  const taskList = tasks
    .map(
      (t) =>
        `[${t.id}] ${t.title} | status=${t.status} | priority=${t.priority}`
    )
    .join('\n');

  const activityLog = recentActivity
    .map(
      (a) =>
        `task=${a.taskId} | ${a.eventType} | ${new Date(a.createdAt).toLocaleTimeString()}`
    )
    .join('\n');

  const blockedTasks = tasks
    .filter((t) => t.status === 'blocked')
    .map((t) => `${t.title}: ${t.description || 'No details'}`)
    .join('\n');

  const prompt = `Generate a daily standup summary for this project.

PROJECT STATUS:
- Total: ${summary.total} tasks
- Completed: ${summary.completed}
- In Progress: ${summary.inProgress}
- Blocked: ${summary.blocked}
- Todo: ${summary.todo}
- Completion rate: ${summary.completionRate}%

TASKS:
${taskList || 'No tasks.'}

LAST 24H ACTIVITY:
${activityLog || 'No activity in the last 24 hours.'}

BLOCKED TASKS:
${blockedTasks || 'No blocked tasks.'}

FORMAT:
- yesterday: What was accomplished in the last 24 hours (task titles)
- today: What should be worked on next (prioritize in_progress, then high-priority todo)
- blockers: Current blockers with brief context
- summary: One-line status (e.g., "3 tasks done, 2 in progress, 1 blocker")

Return as JSON matching the schema.`;

  const { object } = await generateObject({
    model: openrouter(process.env.NEXT_PUBLIC_AI_MODEL || 'google/gemini-3-flash-preview'),
    schema: standupSchema,
    prompt,
  });

  return object;
}
