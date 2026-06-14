import { streamObject } from 'ai';
import { z } from 'zod';
import { getProjectTasks, getProjectDependencies, getExecutionSummary } from '@/services/taskService';
import { db } from '@/lib/db';
import { taskActivity } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { openrouter, DEFAULT_MODEL, formatTaskList, formatActivityLog, formatDependencies } from './ai-prompts';
import { recommendationSchema } from './ai-schemas';

export type TaskRecommendation = z.infer<typeof recommendationSchema>;

export async function aiRecommendNextTask(
  projectId: string
) {
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

  const taskList = formatTaskList(tasks);
  const depList = formatDependencies(dependencies);
  const activityLog = formatActivityLog(recentActivity);

  const system = `ROLE: Senior engineering lead making a tactical decision on what to build next.

DECISION FRAMEWORK (apply in order):
1. UNBLOCK: If any in_progress task has resolved blockers → recommend it
2. COMPLETE: If any in_progress task has no blockers → finish it before starting new work
3. UNBLOCK OTHERS: If a todo task blocks multiple other tasks → recommend it
4. HIGH VALUE: If nothing blocked, pick highest-priority task with most downstream impact
5. QUICK WIN: If priorities are equal, pick smallest estimate to build momentum

CONSTRAINTS:
- Never recommend a blocked task
- Never recommend a task whose prerequisites (dependency graph) aren't met
- If all tasks are done, recommend the user import more tasks or start a new project
- Return the exact taskId from the provided list

REASONING: Show your work. Explain which rule applied and why.`;

  const prompt = `PROJECT STATE:
Total: ${summary.total} | Done: ${summary.completed} | Active: ${summary.inProgress} | Blocked: ${summary.blocked} | Queued: ${summary.todo} | Rate: ${summary.completionRate}%

TASKS:
${taskList}

DEPENDENCY GRAPH:
${depList}

RECENT ACTIVITY (48h):
${activityLog}

Apply the decision framework. Return your recommendation as JSON.`;

  const result = streamObject({
    model: openrouter(DEFAULT_MODEL),
    schema: recommendationSchema,
    system,
    prompt,
  });

  return result;
}