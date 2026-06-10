import { generateObject } from 'ai';
import { z } from 'zod';
import { getTaskById, getProjectDependencies, getProjectTasks } from '@/services/taskService';
import { openrouter, DEFAULT_MODEL, formatTaskList } from './ai-prompts';

const decomposeSchema = z.object({
  subtasks: z.array(
    z.object({
      title: z.string().describe('Verb-first actionable title (e.g., "Create auth middleware")'),
      description: z.string().describe('One sentence: what this subtask accomplishes'),
      estimateMinutes: z.number().describe('30-90 minutes'),
      details: z.string().describe('Exact files, functions, and logic'),
    })
  ),
});

export type DecomposedSubtasks = z.infer<typeof decomposeSchema>;

export async function aiDecomposeTask(
  taskId: string
): Promise<DecomposedSubtasks> {
  const task = await getTaskById(taskId);
  if (!task) throw new Error('Task not found');

  const [dependencies, siblingTasks] = await Promise.all([
    getProjectDependencies(task.projectId),
    getProjectTasks(task.projectId),
  ]);

  const taskDeps = dependencies.filter((d) => d.taskId === taskId);
  const dependents = dependencies.filter((d) => d.dependsOnTaskId === taskId);

  const depContext = taskDeps.length > 0
    ? `Depends on: ${taskDeps.map(d => d.dependsOnTaskId.slice(0, 8)).join(', ')}`
    : 'No upstream dependencies.';

  const dependentContext = dependents.length > 0
    ? `Blocks: ${dependents.map(d => d.taskId.slice(0, 8)).join(', ')}`
    : 'No downstream dependents.';

  const siblingContext = siblingTasks
    .filter(t => t.id !== taskId && t.status === 'in_progress')
    .slice(0, 5)
    .map(t => `- ${t.title} (${t.status})`)
    .join('\n');

  const system = `ROLE: Senior engineer decomposing work into atomic subtasks.

SIZING RULES (enforce strictly):
- Each subtask: 30-90 minutes of focused work
- If it takes >90 min, split further
- If it takes <30 min, batch with an adjacent subtask
- Each subtask must be independently compilable and testable
- No subtask should require knowledge of another subtask's internals

ORDERING RULES:
- Subtask 1 must be a foundation (types, schemas, interfaces)
- Later subtasks build on earlier ones
- Order so each subtask can be verified before starting the next

QUALITY RULES:
- Title must start with a verb (Create, Add, Implement, Write, Set up)
- Details must include exact file paths and function signatures
- No "implement the feature" — say exactly what code to write
- Include error handling and edge cases in details

CONTEXT: Consider the sibling tasks already in progress to avoid overlap.`;

  const prompt = `TASK TO DECOMPOSE:
Title: ${task.title}
Description: ${task.description || 'No description'}
Estimate: ${task.estimateMinutes ?? 'unknown'} minutes
Priority: ${task.priority}
${depContext}
${dependentContext}

${siblingContext ? `ACTIVE SIBLING TASKS:\n${siblingContext}` : 'No other active tasks.'}

Decompose into 3-5 atomic subtasks. Return as JSON.`;

  const { object } = await generateObject({
    model: openrouter(DEFAULT_MODEL),
    schema: decomposeSchema,
    system,
    prompt,
  });

  return object;
}
