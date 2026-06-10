import { generateObject } from 'ai';
import { z } from 'zod';
import { getProjectTasks, getExecutionSummary } from '@/services/taskService';
import { db } from '@/lib/db';
import { taskActivity } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { openrouter, DEFAULT_MODEL, formatTaskList, formatActivityLog } from './ai-prompts';

const standupSchema = z.object({
  yesterday: z.array(z.string()).describe('What was completed or progressed in last 24h'),
  today: z.array(z.string()).describe('Recommended focus for today, ordered by priority'),
  blockers: z.array(z.string()).describe('Active blockers with context'),
  summary: z.string().describe('One-line status: N done, N active, N blocked'),
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

  const taskList = formatTaskList(tasks);
  const activityLog = formatActivityLog(recentActivity);

  const blockedTasks = tasks
    .filter((t) => t.status === 'blocked')
    .map((t) => `- ${t.title}: ${(t.description || 'No details').slice(0, 100)}`)
    .join('\n');

  const system = `ROLE: Engineering manager writing a concise daily standup.

FORMATTING RULES:
- yesterday: 1-3 bullet points of what moved forward (task titles + brief outcome)
- today: 1-3 bullet points of what to focus on (highest leverage work)
- blockers: only real blockers, not "waiting for review"
- summary: exactly "N done, N active, N blocked" format
- No fluff, no pleasantries, no markdown headers

PRIORITIES:
- yesterday: Report actual completions and status changes, not "worked on X"
- today: Prefer finishing in_progress tasks over starting new ones
- blockers: Include what's blocked and brief reason (dependency, technical, scope)

TONE: Direct, factual, skip anything that didn't actually change.`;

  const prompt = `PROJECT: ${summary.total} total | ${summary.completed} done | ${summary.inProgress} active | ${summary.blocked} blocked | ${summary.todo} queued

TASKS:
${taskList}

LAST 24H ACTIVITY:
${activityLog}

${blockedTasks ? `BLOCKED:\n${blockedTasks}` : 'No blockers.'}

Generate standup. Return as JSON.`;

  const { object } = await generateObject({
    model: openrouter(DEFAULT_MODEL),
    schema: standupSchema,
    system,
    prompt,
  });

  return object;
}
