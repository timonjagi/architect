import { GoogleGenAI, Type } from "@google/genai";
import { PromptConfig, OptimizationResult } from "./types";
// import { config } from 'dotenv';
// config({ path: '.env.local' }); // or .env.local

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
    ? `SELECTED ARCHITECTURAL MODULES:\n${config.selectedBlueprints.map(b => `- ${b.name}: ${b.prompt} ---\n\n Submodules: \n -${b.selectedSubLabels.join('\n -')}`).join('\n\n')}`
    : 'No specific blueprints selected.';

  const systemInstruction = `
    You are a Principal Software Architect. Generate a high-fidelity "Architect Specification" (JSON).
    Break down requirements into atomic tasks with logic, test strategies, and priority.

    CORE CONTEXT:
    ${sourcesContext}
    
  ${blueprintContext}
    TECH STACK:
    - Framework: ${config.framework}
    - Styling: ${config.styling}
    - Backend: ${config.backend}
    - Tooling: ${config.tooling.join(', ')}
    - Notifications: ${config.providers?.join(', ') || 'Default'}

    OUTPUT SCHEMA:
    {
      "coldStartGuide": "Markdown for setup",
      "directoryStructure": "ASCII tree",
      "implementationPlan": [{ "id", "title", "description", "details", "testStrategy", "priority", "files_involved", "dependencies", "subtasks" }],
      "architectureNotes": "Boundaries/constraints",
      "fullMarkdownSpec": "A complete, single-file Markdown representation of the entire project specification, including kickoff, plan, and architecture."
    }
  `;

  console.log(systemInstruction);
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
            coldStartGuide: { type: Type.STRING },
            directoryStructure: { type: Type.STRING },
            implementationPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  details: { type: Type.STRING },
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
            architectureNotes: { type: Type.STRING },
            fullMarkdownSpec: { type: Type.STRING }
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
