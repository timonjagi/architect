import { streamObject } from 'ai';
import { z } from 'zod';
import { PromptConfig } from './types';
import { BLUEPRINTS } from './blueprints';
import { openrouter, DEFAULT_MODEL, truncateSource } from './ai-prompts';
import {
  coldStartSchema,
  directoryStructureSchema,
  implementationPlanSchema,
  architectureNotesSchema,
  fullMarkdownSpecSchema,
} from './ai-schemas';

// --- Context building (minimal, grows between stages) ---

function buildCoreContext(config: PromptConfig, rawPrompt: string): string {
  const blueprints = config.selectedBlueprints?.length
    ? config.selectedBlueprints.map(b => b.name).join(', ')
    : 'None';

  return `PROJECT: ${rawPrompt || 'Design the system based on selected modules.'}
STACK: ${config.framework} + ${config.styling} + ${config.backend}
TOOLING: ${config.tooling.join(', ')}
NOTIFICATIONS: ${config.providers?.join(', ') || 'None'}
PAYMENTS: ${config.payments?.join(', ') || 'None'}
STATE: ${config.stateManagement || 'None'}
MODULES: ${blueprints}
CONTEXT: ${config.customContext || 'None'}`;
}

function buildFullSourcesBlock(config: PromptConfig): string {
  if (config.sources.length === 0) return '';
  return `\nPROJECT DOCUMENTS:\n${config.sources.map(s => truncateSource(s.name, s.content)).join('\n\n')}`;
}

function buildBlueprintDetails(config: PromptConfig): string {
  if (!config.selectedBlueprints?.length) return '';
  return `\nSELECTED MODULES:\n${config.selectedBlueprints.map(b => {
    const bp = BLUEPRINTS.find(p => p.id === b.blueprintId);
    const subs = b.selectedSubLabels.map(label => {
      const sub = bp?.subcategories.find(s => s.label === label);
      return sub ? `  ${label}: ${sub.description}` : `  ${label}`;
    }).join('\n');
    return `${b.name} — ${b.prompt}\n${subs}`;
  }).join('\n')}`;
}

// --- Stage prompts ---

function buildStage1Prompt(config: PromptConfig, core: string, sources: string, blueprints: string): string {
  return `ROLE: Principal Software Architect writing a project kickoff guide.

${core}
${sources}
${blueprints}

TASK: Generate a comprehensive Cold Start Guide as markdown.

INCLUDE:
- Prerequisites (runtime versions, tools needed)
- Install commands (exact package manager commands)
- Environment variables template (.env.example format with placeholder values)
- Database initialization steps (if applicable)
- First run command
- Verification steps to confirm setup works

RULES:
- Every package name must be exact
- Every command must be copy-pasteable
- No hand-waving: be specific about what to install and why
- Include version ranges where important`;
}

function buildStage2Prompt(core: string, coldStartSummary: string): string {
  return `ROLE: Principal Software Architect designing project file structure.

${core}

KEY DECISIONS FROM SETUP:
${coldStartSummary}

TASK: Generate the complete directory structure as an ASCII tree.

RULES:
- Every file path must be absolute from project root
- Include all directories and key files
- Show the full tree with proper indentation using ├── and └──
- Group related files logically (features, utilities, types, etc.)
- Include config files (tsconfig, next.config, etc.)
- Include the files mentioned in the setup guide`;
}

function buildStage3Prompt(core: string, coldStartSummary: string, dirSummary: string): string {
  return `ROLE: Principal Software Architect producing a machine-executable implementation plan.

${core}

SETUP SUMMARY:
${coldStartSummary}

FILE STRUCTURE SUMMARY:
${dirSummary}

TASK: Generate an ordered list of implementation tasks.

RULES:
- Each task must be atomic: one developer, one PR, one testable unit
- Tasks must be ordered by dependency (no forward references)
- Each task must be completable in one focused work session
- Every file path must be absolute from project root
- Every function must include signature + return type
- Include exact file paths and function names in details
- Include subtasks for complex tasks (30-90 min each)
- Start with foundation tasks (types, schemas, interfaces) then build up`;
}

function buildStage4Prompt(core: string, coldStartSummary: string, dirSummary: string, planSummary: string): string {
  return `ROLE: Principal Software Architect documenting system architecture.

${core}

SETUP SUMMARY:
${coldStartSummary}

FILE STRUCTURE SUMMARY:
${dirSummary}

IMPLEMENTATION PLAN SUMMARY:
${planSummary}

TASK: Generate comprehensive architecture documentation.

INCLUDE:
- High-level system design overview
- Component diagram (mermaid syntax)
- Data flow description
- Security boundaries and authentication flow
- Scaling strategy and performance considerations
- Key design decisions and trade-offs
- Integration points between components

RULES:
- Use mermaid syntax for diagrams
- Be specific about component responsibilities
- Include data flow between components
- Document security boundaries clearly`;
}

function buildStage5Prompt(core: string, coldStartGuide: string, directoryStructure: string, implementationPlan: string, architectureNotes: string): string {
  return `ROLE: Principal Software Architect compiling a complete project specification.

${core}

You have already generated the following sections:

=== COLD START GUIDE ===
${coldStartGuide}

=== DIRECTORY STRUCTURE ===
${directoryStructure}

=== IMPLEMENTATION PLAN ===
${implementationPlan.slice(0, 4000)}

=== ARCHITECTURE NOTES ===
${architectureNotes}

TASK: Combine all sections into a single, comprehensive, readable markdown document.

STRUCTURE:
1. Project Overview (brief summary)
2. Cold Start Guide (from above)
3. Architecture (from above, with diagrams)
4. File Structure (from above)
5. Implementation Plan (from above, with task details)
6. Testing Strategy
7. Deployment Notes

RULES:
- This should be a self-contained document a developer can read to understand the entire project
- Include all content from the sections above, refined and organized
- Add section headers and navigation
- Ensure consistency between sections
- Add any missing cross-references between tasks and files`;
}

// --- Summary extractors (keep context small for later stages) ---

function extractColdStartSummary(coldStartGuide: string): string {
  // Extract key info: packages, env vars, DB setup
  const lines = coldStartGuide.split('\n');
  const summary: string[] = [];
  let inEnvSection = false;
  let inDbSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('env') || lower.includes('environment')) inEnvSection = true;
    if (lower.includes('database') || lower.includes('postgres') || lower.includes('supabase')) inDbSection = true;
    if (lower.startsWith('#') || lower.startsWith('##')) {
      inEnvSection = false;
      inDbSection = false;
    }

    // Capture install commands
    if (line.match(/^(npm|bun|yarn|pnpm)\s+(install|add|i)\s+/)) {
      summary.push(`Install: ${line.trim()}`);
    }
    // Capture env vars
    if (inEnvSection && line.match(/^[A-Z_]+=|\.env/)) {
      summary.push(`Env: ${line.trim()}`);
    }
    // Capture DB setup
    if (inDbSection && (line.includes('migrate') || line.includes('push') || line.includes('create'))) {
      summary.push(`DB: ${line.trim()}`);
    }
  }

  return summary.length > 0 ? summary.join('\n') : coldStartGuide.slice(0, 800);
}

function extractDirSummary(directoryStructure: string): string {
  // Extract top-level directories and key files
  const lines = directoryStructure.split('\n');
  const summary: string[] = [];
  let depth = 0;

  for (const line of lines) {
    // Count depth by indentation
    const trimmed = line.trimStart();
    if (trimmed.startsWith('├──') || trimmed.startsWith('└──')) {
      const name = trimmed.replace(/^[├└──\s]+/, '').split('/')[0];
      if (name && !summary.includes(name) && !name.startsWith('.')) {
        summary.push(name);
      }
    }
  }

  return summary.length > 0 ? `Key directories/files: ${summary.slice(0, 20).join(', ')}` : directoryStructure.slice(0, 1000);
}

function extractPlanSummary(implementationPlan: any[]): string {
  // Extract task titles and order
  if (!Array.isArray(implementationPlan) || implementationPlan.length === 0) return 'No tasks.';

  return implementationPlan.map((t: any, i: number) =>
    `${i + 1}. ${t.title || 'Untitled'} (${t.priority || 'medium'})`
  ).join('\n');
}

// --- Main function ---

export const optimizePrompt = async (
  rawPrompt: string,
  config: PromptConfig
) => {
  if (!(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY)) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const core = buildCoreContext(config, rawPrompt);
  const sources = buildFullSourcesBlock(config);
  const blueprints = buildBlueprintDetails(config);
  const prompt = rawPrompt || 'Design the system based on selected modules.';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Stage 1: Cold Start Guide (full sources + blueprints)
        const stage1 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: coldStartSchema,
          system: buildStage1Prompt(config, core, sources, blueprints),
          prompt,
        });
        const s1 = await stage1.object;
        const coldStartSummary = extractColdStartSummary(s1.coldStartGuide);
        controller.enqueue(encoder.encode(`{"coldStartGuide":${JSON.stringify(s1.coldStartGuide)}`));

        // Stage 2: Directory Structure (no sources, condensed context)
        const stage2 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: directoryStructureSchema,
          system: buildStage2Prompt(core, coldStartSummary),
          prompt,
        });
        const s2 = await stage2.object;
        const dirSummary = extractDirSummary(s2.directoryStructure);
        controller.enqueue(encoder.encode(`,"directoryStructure":${JSON.stringify(s2.directoryStructure)}`));

        // Stage 3: Implementation Plan (no sources, condensed context)
        const stage3 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: implementationPlanSchema,
          system: buildStage3Prompt(core, coldStartSummary, dirSummary),
          prompt,
        });
        const s3 = await stage3.object;
        const planSummary = extractPlanSummary(s3.implementationPlan);
        controller.enqueue(encoder.encode(`,"implementationPlan":${JSON.stringify(s3.implementationPlan)}`));

        // Stage 4: Architecture Notes (no sources, condensed context)
        const stage4 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: architectureNotesSchema,
          system: buildStage4Prompt(core, coldStartSummary, dirSummary, planSummary),
          prompt,
        });
        const s4 = await stage4.object;
        controller.enqueue(encoder.encode(`,"architectureNotes":${JSON.stringify(s4.architectureNotes)}`));

        // Stage 5: Full Spec (full content for assembly)
        const stage5 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: fullMarkdownSpecSchema,
          system: buildStage5Prompt(core, s1.coldStartGuide, s2.directoryStructure, JSON.stringify(s3.implementationPlan), s4.architectureNotes),
          prompt,
        });
        const s5 = await stage5.object;
        controller.enqueue(encoder.encode(`,"fullMarkdownSpec":${JSON.stringify(s5.fullMarkdownSpec)}}`));

        controller.close();
      } catch (error) {
        console.error("AI Service Error:", error);
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};