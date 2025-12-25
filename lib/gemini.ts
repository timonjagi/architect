
import { GoogleGenAI, Type } from "@google/genai";
import { PromptConfig, OptimizationResult } from "./types";

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
    : 'No specific blueprints selected.';

  const systemInstruction = `
    You are a Principal Software Architect. Your goal is to generate a "Speckit" - a high-fidelity implementation plan that allows a coding agent to build a feature from a COLD START.

    YOUR OUTPUT MUST FOLLOW THE DEPTH OF A MASTER BACKLOG:
    1. Break the feature into logical, atomic Tasks.
    2. Each Task must have detailed logic, test strategies, and priority.

    CORE ARCHITECTURE SELECTION:
    ${blueprintContext}

    ${sourcesContext}

    TECH STACK (MANDATORY):
    - Framework: ${config.framework}
    - Styling: ${config.styling}
    - Backend: ${config.backend}
    - Tooling: ${config.tooling.join(', ')}
    - Notification Providers: ${config.providers?.join(', ') || 'Standard Web'}
    - Payment Providers: ${config.payments?.join(', ') || 'Not applicable'}

    OUTPUT JSON STRUCTURE:
    - coldStartGuide: Markdown for environment setup.
    - directoryStructure: Text-based tree representing file organization.
    - implementationPlan: Array of TaskItem objects.
    - architectureNotes: System boundaries and constraints.
    - fullMarkdownSpec: Complete spec as one string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Additional User Instructions: "${rawPrompt || 'Build according to selected blueprints.'}"`,
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
