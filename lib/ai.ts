import { generateObject } from 'ai';
import { z } from 'zod';
import { PromptConfig, OptimizationResult } from './types';
import { BLUEPRINTS } from './blueprints';
import { openrouter, DEFAULT_MODEL, truncateSource } from './ai-prompts';

const architectureSchema = z.object({
  coldStartGuide: z.string().describe("Markdown setup guide: prerequisites, install commands, .env template, DB init. Be specific with exact package names."),

  directoryStructure: z.string().describe("ASCII tree of project structure."),

  implementationPlan: z.array(z.object({
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
  })).describe("Ordered implementation tasks. Each must be atomic: one developer, one PR, one testable unit. Include exact file paths and function names."),

  architectureNotes: z.string().describe("System architecture: high-level design, component diagram (mermaid), data flow, security boundaries, scaling strategy."),

  fullMarkdownSpec: z.string().describe("Complete single-file spec combining kickoff, architecture, and implementation plan into a readable document.")
});

function buildSystemPrompt(config: PromptConfig, sourcesContext: string, blueprintContext: string): string {
  return `ROLE: Principal Software Architect producing a machine-executable project specification.

OUTPUT RULES:
- Every file path must be absolute from project root
- Every function must include signature + return type
- Every dependency must include exact package name and version range
- No hand-waving: "set up auth" is wrong; "create lib/supabase/server.ts with createServerClient using cookies()" is right
- Implementation tasks must be ordered by dependency (no forward references)
- Each task must be completable in one focused work session

TECH STACK:
- Framework: ${config.framework}
- Styling: ${config.styling}
- Backend: ${config.backend}
- Tooling: ${config.tooling.join(', ')}
- Notifications: ${config.providers?.join(', ') || 'None'}
- Payments: ${config.payments?.join(', ') || 'None'}
- Custom Context: ${config.customContext || 'None'}

${sourcesContext}

${blueprintContext}

REASONING: Before writing each section, consider: What would a developer need to see to implement this without asking questions? Include that.`;
}

export const optimizePrompt = async (
  rawPrompt: string,
  config: PromptConfig
): Promise<OptimizationResult> => {
  if (!(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY)) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const sourcesContext = config.sources.length > 0
    ? `PROJECT DOCUMENTS:\n${config.sources.map(s => truncateSource(s.name, s.content)).join('\n\n')}`
    : '';

  const blueprintContext = config.selectedBlueprints?.length
    ? `SELECTED MODULES:\n${config.selectedBlueprints.map(b => {
      const bp = BLUEPRINTS.find(p => p.id === b.blueprintId);
      const subs = b.selectedSubLabels.map(label => {
        const sub = bp?.subcategories.find(s => s.label === label);
        return sub ? `  ${label}: ${sub.description}` : `  ${label}`;
      }).join('\n');
      return `${b.name} — ${b.prompt}\n${subs}`;
    }).join('\n')}`
    : '';

  const system = buildSystemPrompt(config, sourcesContext, blueprintContext);

  try {
    const { object } = await generateObject({
      model: openrouter(DEFAULT_MODEL),
      schema: architectureSchema,
      system,
      prompt: rawPrompt || 'Design the system based on selected modules.',
    });

    return object;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate specification with AI Service.");
  }
};
