import { z } from 'zod';

export const taskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  details: z.string().describe("Exact file paths, function signatures, library imports, and logic flow. No ambiguity."),
  testStrategy: z.string().optional().default("Manual verification"),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  files_involved: z.array(z.string()).optional().default([]),
  dependencies: z.array(z.string()).optional().default([]),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    details: z.string().optional().default(""),
    testStrategy: z.string().optional().default(""),
    priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
    dependencies: z.array(z.string()).optional().default([]),
    files_involved: z.array(z.string()).optional().default([]),
  })).optional().default([])
});

export const coldStartSchema = z.object({
  coldStartGuide: z.string().describe("Markdown setup guide: prerequisites, install commands, .env template, DB init. Be specific with exact package names."),
});

export const directoryStructureSchema = z.object({
  directoryStructure: z.string().describe("ASCII tree of project structure."),
});

export const implementationPlanSchema = z.object({
  implementationPlan: z.array(taskItemSchema).describe("Ordered implementation tasks. Each must be atomic: one developer, one PR, one testable unit. Include exact file paths and function names."),
});

export const architectureNotesSchema = z.object({
  architectureNotes: z.string().describe("System architecture: high-level design, component diagram (mermaid), data flow, security boundaries, scaling strategy."),
});

export const fullMarkdownSpecSchema = z.object({
  fullMarkdownSpec: z.string().describe("Complete single-file spec combining kickoff, architecture, and implementation plan into a readable document.")
});

export const architectureSchema = z.object({
  coldStartGuide: z.string(),
  directoryStructure: z.string(),
  implementationPlan: z.array(taskItemSchema),
  architectureNotes: z.string(),
  fullMarkdownSpec: z.string(),
});

export const recommendationSchema = z.object({
  taskId: z.string().describe('Exact task ID from the list'),
  title: z.string().describe('Task title'),
  rationale: z.string().describe('2-3 sentence reasoning: why this task, why now, what unblocks'),
  estimatedMinutes: z.number().describe('Realistic estimate based on scope'),
  blockers: z.array(z.string()).describe('Active blockers for this specific task'),
  prerequisites: z.array(z.string()).describe('Task IDs that must complete first'),
});

export const decomposeSchema = z.object({
  subtasks: z.array(
    z.object({
      title: z.string().describe('Verb-first actionable title (e.g., "Create auth middleware")'),
      description: z.string().describe('One sentence: what this subtask accomplishes'),
      estimateMinutes: z.number().describe('30-90 minutes'),
      details: z.string().describe('Exact files, functions, and logic'),
    })
  ),
});

export const standupSchema = z.object({
  yesterday: z.array(z.string()).describe('What was completed or progressed in last 24h'),
  today: z.array(z.string()).describe('Recommended focus for today, ordered by priority'),
  blockers: z.array(z.string()).describe('Active blockers with context'),
  summary: z.string().describe('One-line status: N done, N active, N blocked'),
});