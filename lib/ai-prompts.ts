import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openrouter = createOpenRouter({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '',
});

export const DEFAULT_MODEL = process.env.NEXT_PUBLIC_AI_MODEL || 'google/gemini-3-flash-preview';

const MAX_SOURCE_CHARS = 3000;
const MAX_ACTIVITY_ITEMS = 15;

export function truncateSource(name: string, content: string, maxChars = MAX_SOURCE_CHARS): string {
  if (content.length <= maxChars) return `--- ${name} ---\n${content}`;
  return `--- ${name} ---\n${content.slice(0, maxChars)}\n... [truncated, ${content.length - maxChars} chars omitted]`;
}

export function formatTaskList(tasks: {
  id: string; title: string; status: string; priority: string;
  estimateMinutes: number | null; description: string | null;
}[]): string {
  if (tasks.length === 0) return 'No tasks.';
  return tasks.map(t =>
    `[${t.id}] ${t.title} | status=${t.status} | pri=${t.priority} | est=${t.estimateMinutes ?? '?'}m | ${(t.description || '').slice(0, 120)}`
  ).join('\n');
}

export function formatActivityLog(events: {
  createdAt: Date; taskId: string; eventType: string; payload: any;
}[]): string {
  if (events.length === 0) return 'No recent activity.';
  const limited = events.slice(0, MAX_ACTIVITY_ITEMS);
  const log = limited.map(e =>
    `${new Date(e.createdAt).toISOString().slice(0, 16)} | ${e.taskId.slice(0, 8)} | ${e.eventType}`
  ).join('\n');
  return events.length > MAX_ACTIVITY_ITEMS
    ? `${log}\n... +${events.length - MAX_ACTIVITY_ITEMS} more events`
    : log;
}

export function formatDependencies(deps: { dependsOnTaskId: string; taskId: string }[]): string {
  if (deps.length === 0) return 'No dependencies.';
  return deps.map(d => `${d.dependsOnTaskId.slice(0, 8)} → ${d.taskId.slice(0, 8)}`).join('\n');
}
