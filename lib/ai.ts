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

function buildTechStackContext(config: PromptConfig): string {
  return `TECH STACK:
- Framework: ${config.framework}
- Styling: ${config.styling}
- Backend: ${config.backend}
- Tooling: ${config.tooling.join(', ')}
- Notifications: ${config.providers?.join(', ') || 'None'}
- Payments: ${config.payments?.join(', ') || 'None'}
- Custom Context: ${config.customContext || 'None'}`;
}

function buildContextBlock(config: PromptConfig): { techStack: string; sources: string; blueprints: string } {
  const techStack = buildTechStackContext(config);

  const sources = config.sources.length > 0
    ? `PROJECT DOCUMENTS:\n${config.sources.map(s => truncateSource(s.name, s.content)).join('\n\n')}`
    : '';

  const blueprints = config.selectedBlueprints?.length
    ? `SELECTED MODULES:\n${config.selectedBlueprints.map(b => {
      const bp = BLUEPRINTS.find(p => p.id === b.blueprintId);
      const subs = b.selectedSubLabels.map(label => {
        const sub = bp?.subcategories.find(s => s.label === label);
        return sub ? `  ${label}: ${sub.description}` : `  ${label}`;
      }).join('\n');
      return `${b.name} — ${b.prompt}\n${subs}`;
    }).join('\n')}`
    : '';

  return { techStack, sources, blueprints };
}

function buildColdStartPrompt(config: PromptConfig, ctx: { techStack: string; sources: string; blueprints: string }): string {
  return `ROLE: Principal Software Architect writing a project kickoff guide.

${ctx.techStack}

${ctx.sources}

${ctx.blueprints}

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

function buildDirectoryStructurePrompt(config: PromptConfig, ctx: { techStack: string; sources: string; blueprints: string }, coldStartGuide: string): string {
  return `ROLE: Principal Software Architect designing project file structure.

${ctx.techStack}

${ctx.sources}

${ctx.blueprints}

COLD START GUIDE (already generated):
${coldStartGuide.slice(0, 1500)}

TASK: Generate the complete directory structure as an ASCII tree.

RULES:
- Every file path must be absolute from project root
- Include all directories and key files
- Show the full tree with proper indentation using ├── and └──
- Group related files logically (features, utilities, types, etc.)
- Include config files (tsconfig, next.config, etc.)
- Include the files mentioned in the cold start guide`;
}

function buildImplementationPlanPrompt(config: PromptConfig, ctx: { techStack: string; sources: string; blueprints: string }, coldStartGuide: string, directoryStructure: string): string {
  return `ROLE: Principal Software Architect producing a machine-executable implementation plan.

${ctx.techStack}

${ctx.sources}

${ctx.blueprints}

COLD START GUIDE:
${coldStartGuide.slice(0, 1500)}

DIRECTORY STRUCTURE:
${directoryStructure.slice(0, 2000)}

TASK: Generate an ordered list of implementation tasks.

RULES:
- Each task must be atomic: one developer, one PR, one testable unit
- Tasks must be ordered by dependency (no forward references)
- Each task must be completable in one focused work session
- Every file path must be absolute from project root
- Every function must include signature + return type
- Every dependency must include exact package name and version range
- Include exact file paths and function names in details
- Include subtasks for complex tasks (30-90 min each)
- Start with foundation tasks (types, schemas, interfaces) then build up`;
}

function buildArchitectureNotesPrompt(config: PromptConfig, ctx: { techStack: string; sources: string; blueprints: string }, coldStartGuide: string, directoryStructure: string, implementationPlan: string): string {
  return `ROLE: Principal Software Architect documenting system architecture.

${ctx.techStack}

${ctx.sources}

${ctx.blueprints}

COLD START GUIDE:
${coldStartGuide.slice(0, 1000)}

DIRECTORY STRUCTURE:
${directoryStructure.slice(0, 1500)}

IMPLEMENTATION PLAN:
${implementationPlan.slice(0, 3000)}

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

function buildFullSpecPrompt(config: PromptConfig, ctx: { techStack: string; sources: string; blueprints: string }, coldStartGuide: string, directoryStructure: string, implementationPlan: string, architectureNotes: string): string {
  return `ROLE: Principal Software Architect compiling a complete project specification.

${ctx.techStack}

${ctx.sources}

${ctx.blueprints}

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

export const optimizePrompt = async (
  rawPrompt: string,
  config: PromptConfig
) => {
  if (!(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY)) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const ctx = buildContextBlock(config);
  const prompt = rawPrompt || 'Design the system based on selected modules.';

  const encoder = new TextEncoder();
  let isFirst = true;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Stage 1: Cold Start Guide
        const stage1 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: coldStartSchema,
          system: buildColdStartPrompt(config, ctx),
          prompt,
        });
        const s1 = await stage1.object;
        const encoded1 = JSON.stringify(s1.coldStartGuide);
        controller.enqueue(encoder.encode(`{"coldStartGuide":${encoded1}`));
        isFirst = false;

        // Stage 2: Directory Structure
        const stage2 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: directoryStructureSchema,
          system: buildDirectoryStructurePrompt(config, ctx, s1.coldStartGuide),
          prompt,
        });
        const s2 = await stage2.object;
        const encoded2 = JSON.stringify(s2.directoryStructure);
        controller.enqueue(encoder.encode(`,"directoryStructure":${encoded2}`));

        // Stage 3: Implementation Plan
        const stage3 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: implementationPlanSchema,
          system: buildImplementationPlanPrompt(config, ctx, s1.coldStartGuide, s2.directoryStructure),
          prompt,
        });
        const s3 = await stage3.object;
        const encoded3 = JSON.stringify(s3.implementationPlan);
        controller.enqueue(encoder.encode(`,"implementationPlan":${encoded3}`));

        // Stage 4: Architecture Notes
        const stage4 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: architectureNotesSchema,
          system: buildArchitectureNotesPrompt(config, ctx, s1.coldStartGuide, s2.directoryStructure, JSON.stringify(s3.implementationPlan)),
          prompt,
        });
        const s4 = await stage4.object;
        const encoded4 = JSON.stringify(s4.architectureNotes);
        controller.enqueue(encoder.encode(`,"architectureNotes":${encoded4}`));

        // Stage 5: Full Markdown Spec
        const stage5 = streamObject({
          model: openrouter(DEFAULT_MODEL),
          schema: fullMarkdownSpecSchema,
          system: buildFullSpecPrompt(config, ctx, s1.coldStartGuide, s2.directoryStructure, JSON.stringify(s3.implementationPlan), s4.architectureNotes),
          prompt,
        });
        const s5 = await stage5.object;
        const encoded5 = JSON.stringify(s5.fullMarkdownSpec);
        controller.enqueue(encoder.encode(`,"fullMarkdownSpec":${encoded5}}`));

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