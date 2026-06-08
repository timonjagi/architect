import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { getTaskById, getProjectDependencies } from '@/services/taskService';

const openrouter = createOpenRouter({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '',
});

const decomposeSchema = z.object({
  subtasks: z.array(
    z.object({
      title: z.string().describe('Short, actionable subtask title'),
      description: z.string().describe('What this subtask accomplishes'),
      estimateMinutes: z.number().describe('Estimated minutes (30-90)'),
      details: z.string().describe('Technical implementation details'),
    })
  ),
});

export type DecomposedSubtasks = z.infer<typeof decomposeSchema>;

export async function aiDecomposeTask(
  taskId: string
): Promise<DecomposedSubtasks> {
  const task = await getTaskById(taskId);
  if (!task) throw new Error('Task not found');

  const dependencies = await getProjectDependencies(task.projectId);
  const taskDeps = dependencies.filter((d) => d.taskId === taskId);

  const depList = taskDeps.length > 0
    ? `Dependencies: ${taskDeps.map((d) => d.dependsOnTaskId).join(', ')}`
    : 'No dependencies.';

  const prompt = `You are a senior software engineer breaking down a task into smaller, independently completable subtasks.

TASK TO DECOMPOSE:
- Title: ${task.title}
- Description: ${task.description || 'No description'}
- Current estimate: ${task.estimateMinutes || 'unknown'} minutes
- Priority: ${task.priority}
- ${depList}

INSTRUCTIONS:
1. Break this into 3-5 subtasks
2. Each subtask should be 30-90 minutes
3. Each subtask should be independently testable
4. Order them by dependency (first subtask has no prerequisites)
5. Include specific technical details for each
6. Do NOT repeat the parent task — these are components of it

Return the decomposed subtasks as JSON matching the schema.`;

  const { object } = await generateObject({
    model: openrouter(process.env.NEXT_PUBLIC_AI_MODEL || 'google/gemini-3-flash-preview'),
    schema: decomposeSchema,
    prompt,
  });

  return object;
}
