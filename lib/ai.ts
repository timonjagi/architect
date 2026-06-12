import { streamObject } from 'ai';
import { z } from 'zod';
import { PromptConfig } from './types';
import { BLUEPRINTS } from './blueprints';
import { openrouter, DEFAULT_MODEL, truncateSource } from './ai-prompts';
import { architectureSchema } from './ai-schemas';

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
) => {
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
    const result = streamObject({
      model: openrouter(DEFAULT_MODEL),
      schema: architectureSchema,
      system,
      prompt: rawPrompt || 'Design the system based on selected modules.',
    });

    return result;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate specification with AI Service.");
  }
};