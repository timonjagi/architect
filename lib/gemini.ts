import { GoogleGenAI, Type } from "@google/genai";
import { PromptConfig, OptimizationResult } from "./types";
// import { config } from 'dotenv';
// config({ path: '.env.local' }); // or .env.local

import { BLUEPRINTS } from "./blueprints";
// ... imports

/**
 * Transforms a developer requirement into a high-fidelity implementation specification.
 */
export const optimizePrompt = async (
  rawPrompt: string,
  config: PromptConfig
): Promise<OptimizationResult> => {
  // Always initialize with named parameter for apiKey right before the request
  //@ts-ignore
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.log("API Key is missing. Please ensure your environment is configured.");
    throw new Error("API Key is missing. Please ensure your environment is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

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

    ${blueprintContext}
    
    OUTPUT SCHEMA:
    {
      "coldStartGuide": "Comprehensive Markdown guide for project setup. MUST include: 1) Prerequisite tools, 2) 'npm install' commands with ALL required packages (exact names), 3) Environment variable templates (.env.example), 4) Database initialization steps.",
      "directoryStructure": "ASCII tree",
      "implementationPlan": "A detailed, step-by-step implementation roadmap to guide AI coding agents. Each task must be atomic and include all rudimentary details needed for a junior developer to execute it without questions. It should include all files to create/edit, specific libraries to use, and logic flow. Do not be vague. The selected blueprint modules must be incorporated into the implementation plan.",
      "architectureNotes": "Detailed Markdown documentation of the system architecture. MUST include: 1) High-level system design, 2) Component interaction diagrams (mermaid), 3) Data flow descriptions, 4) Security boundaries, 5) Scalability strategies.",
      "fullMarkdownSpec": "A complete, single-file Markdown representation of the entire project specification, including kickoff, plan, and architecture."
    }
  `;

  //console.log(systemInstruction);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Prompt: ${rawPrompt || 'Design the system based on selected modules.'}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coldStartGuide: {
              type: Type.STRING,
              description: "Comprehensive Markdown guide. Must include: 1) Prerequisites, 2) Exact 'npm install' commands with specific packages, 3) Complete .env.example with all keys, 4) Database setup/migration steps."
            },
            directoryStructure: { type: Type.STRING },
            implementationPlan: {
              type: Type.ARRAY,
              description: "A detailed, step-by-step implementation roadmap to guide AI coding agents. Each task must be atomic and include all rudimentary details needed for a junior developer to execute it without questions. It should include all files to create/edit, specific libraries to use, and logic flow. Do not be vague. The selected blueprint modules must be incorporated into the implementation plan according to the PRD shared in the system instruction.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  details: {
                    type: Type.STRING,
                    description: "Extremely detailed technical instructions s. Specify exact file paths, function names to create/edit, specific libraries to use, and logic flow. Do not be vague."
                  },
                  testStrategy: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                  files_involved: { type: Type.ARRAY, items: { type: Type.STRING } },
                  dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  subtasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["id", "title", "description"]
                    }
                  }
                },
                required: ["id", "title", "description", "details", "testStrategy", "priority", "files_involved", "dependencies", "subtasks"]
              }
            },
            architectureNotes: {
              type: Type.STRING,
              description: "A deep-dive technical document. Must include: 1) System boundaries, 2) Data flow diagrams (Mermaid), 3) Comparison of selected patterns vs alternatives, 4) Security implementation details (RLS policies, etc)."
            },
            fullMarkdownSpec: {
              type: Type.STRING,
              description: "The Single Source of Truth. A massive markdown file combining the Kickoff, Architecture, and a readable version of the Plan."
            }
          },
          required: ["coldStartGuide", "directoryStructure", "implementationPlan", "architectureNotes", "fullMarkdownSpec"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Received empty response from Gemini.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Architecture optimization failed:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate system specification.");
  }
};
