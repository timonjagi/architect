
import { GoogleGenAI, Type } from "@google/genai";
import { PromptConfig, OptimizationResult, Source } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const optimizePrompt = async (
  rawPrompt: string,
  config: PromptConfig
): Promise<OptimizationResult> => {
  const sourcesContext = config.sources.length > 0 
    ? `PROJECT DOCUMENTS PROVIDED:\n${config.sources.map(s => `--- ${s.name} ---\n${s.content}`).join('\n\n')}`
    : '';

  const blueprintContext = config.selectedBlueprints?.length 
    ? `SELECTED ARCHITECTURAL MODULES (PRIMARY CONTEXT):\n${config.selectedBlueprints.map(b => `- ${b.name}: ${b.selectedSubLabels.join(', ')}`).join('\n')}`
    : 'No specific blueprints selected. Build according to general best practices for the chosen stack.';

  const systemInstruction = `
    You are a Principal Software Architect. Your goal is to generate a "Speckit" - a high-fidelity implementation plan that allows a coding agent to build a feature from a COLD START.

    YOUR OUTPUT MUST FOLLOW THE DEPTH OF A MASTER BACKLOG:
    1. Break the feature into logical, atomic Tasks.
    2. Each Task must have:
       - 'details': Exact implementation logic, edge cases to handle, and API patterns.
       - 'testStrategy': Step-by-step verification (e.g., "Check Supabase RLS by trying to access ID 123 from User B").
       - 'priority': high/medium/low.
       - 'files_involved': Specific paths.

    CORE ARCHITECTURE SELECTION:
    ${blueprintContext}

    ${sourcesContext}

    TECH STACK (MANDATORY):
    - Framework: ${config.framework}
    - Styling: ${config.styling}
    - Backend: ${config.backend}
    - Tooling: ${config.tooling.join(', ')}
    - Notifications: ${config.providers.join(', ')}

    INSTRUCTIONS:
    - Prioritize the 'SELECTED ARCHITECTURAL MODULES' when designing the system.
    - If user provides 'Additional Requirements', integrate them into the architectural plan.
    - Focus on self-hostable, modern patterns (e.g., Row Level Security in DB, Server Actions in Next.js).

    OUTPUT JSON STRUCTURE:
    - coldStartGuide: Markdown for initial environment setup, essential library installs, and core boilerplate files.
    - directoryStructure: Text-based tree representing the file organization.
    - implementationPlan: Array of TaskItem objects representing the step-by-step build phases.
    - architectureNotes: Critical system boundaries, performance constraints, and state management strategy.
    - fullMarkdownSpec: Complete spec as one string formatted for easy reading.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Additional User Instructions: "${rawPrompt || 'Build according to selected blueprints and tech stack.'}"`,
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
                  dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            architectureNotes: { type: Type.STRING },
            fullMarkdownSpec: { type: Type.STRING }
          },
          required: ["coldStartGuide", "directoryStructure", "implementationPlan", "architectureNotes", "fullMarkdownSpec"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Optimization failed:", error);
    throw new Error("Failed to generate Speckit.");
  }
};
