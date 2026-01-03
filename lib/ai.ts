import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { PromptConfig, OptimizationResult } from './types';
import { BLUEPRINTS } from './blueprints';

// import { config } from 'dotenv';
// config({ path: '.env.local' }); // or .env.local

const openrouter = createOpenRouter({
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "",
});

// Define the schema using Zod with detailed descriptions
const architectureSchema = z.object({
  coldStartGuide: z.string().describe("Comprehensive Markdown guide for project setup. MUST include: 1) Prerequisite tools, 2) Exact 'npm install' commands with ALL required packages (exact names), 3) Environment variable templates (.env.example), 4) Database initialization steps."),

  directoryStructure: z.string().describe("ASCII tree representation of the project structure."),

  implementationPlan: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    details: z.string().describe("Extremely detailed technical instructions. Specify exact file paths, function names to create/edit, specific libraries to use, and logic flow. Do not be vague."),
    testStrategy: z.string().optional().default("Manual verification"),
    priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
    files_involved: z.array(z.string()).optional().default([]),
    dependencies: z.array(z.string()).optional().default([]),
    subtasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      details: z.string().describe("Extremely detailed technical instructions. Specify exact file paths, function names to create/edit, specific libraries to use, and logic flow. Do not be vague.").optional().default(""),
      testStrategy: z.string().optional().default(""),
      priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
      dependencies: z.array(z.string()).optional().default([]),
      files_involved: z.array(z.string()).optional().default([]),
    })).optional().default([])
  })).describe("A detailed, step-by-step implementation roadmap to guide AI coding agents. Each task must be atomic and include all rudimentary details needed for a junior developer to execute it without questions. It should include all files to create/edit, specific libraries to use, and logic flow. Do not be vague. The selected blueprint modules must be incorporated into the implementation plan."),

  architectureNotes: z.string().describe("Detailed Markdown documentation of the system architecture. MUST include: 1) High-level system design, 2) Component interaction diagrams (mermaid), 3) Data flow descriptions, 4) Security boundaries, 5) Scalability strategies."),

  fullMarkdownSpec: z.string().describe("A complete, single-file Markdown representation of the entire project specification, including kickoff, plan, and architecture.")
});

export const optimizePrompt = async (
  rawPrompt: string,
  config: PromptConfig
): Promise<OptimizationResult> => {
  if (!(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY)) {
    console.error("OPENROUTER_API_KEY is missing.");
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const sourcesContext = config.sources.length > 0
    ? `PROJECT DOCUMENTS PROVIDED:\n${config.sources.map(s => `--- ${s.name} ---\n${s.content}`).join('\n\n')}`
    : '';

  const blueprintContext = config.selectedBlueprints?.length
    ? `SELECTED ARCHITECTURAL MODULES:\n${config.selectedBlueprints.map(b => {
      const originalBp = BLUEPRINTS.find(bp => bp.id === b.blueprintId);
      const subDetails = b.selectedSubLabels.map(label => {
        const sub = originalBp?.subcategories.find(s => s.label === label);
        return sub ? `  - ${label}: ${sub.description}` : `  - ${label}`;
      }).join('\n');
      return `MODULE: ${b.name}: ${b.prompt}\nSUB-MODULES TO BE INCLUDED:\n${subDetails}`;
    }).join('\n\n------------------\n\n')}`
    : 'No specific blueprints selected.';

  const systemInstruction = `
    You are a Principal Software Architect. Generate a high-fidelity "Architect Specification" (JSON).
    Break down requirements into atomic tasks with logic, test strategies, and priority.

    CORE CONTEXT:
    ${sourcesContext}

    TECH STACK:
    - Framework: ${config.framework}
    - Styling: ${config.styling}
    - Backend: ${config.backend}
    - Tooling: ${config.tooling.join(', ')}
    - Notifications: ${config.providers?.join(', ') || 'Default'}
    - Payments: ${config.payments?.join(', ') || 'Default'}
    - Custom Context: ${config.customContext || 'None'}

    ${blueprintContext}
  `;

  try {
    const { object } = await generateObject({
      model: openrouter(process.env.NEXT_PUBLIC_AI_MODEL || 'google/gemini-3-flash-preview'),
      schema: architectureSchema,
      system: systemInstruction + "\n\nIMPORTANT: You must return a valid JSON object matching the schema exactly. Do not wrap the JSON in markdown code blocks.",
      prompt: rawPrompt || 'Design the system based on selected modules.',
    });

    return object;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate specification with AI Service.");
  }
};
