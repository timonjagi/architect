
import { GoogleGenAI, Type } from "@google/genai";
import { PromptConfig, OptimizationResult, Source } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Merges a generic blueprint prompt with the specific context of uploaded documents.
 */
export const contextualizeBlueprint = async (
  blueprintName: string,
  basePrompt: string,
  sources: Source[]
): Promise<string> => {
  if (sources.length === 0) return basePrompt;

  const sourcesSummary = sources.map(s => `[${s.name}]: ${s.content.substring(0, 1000)}...`).join('\n');

  const systemInstruction = `
    You are a technical requirement specialist. 
    Your task is to take a generic "Blueprint" for a web feature and REWRITE it to be specific to the project's context provided in the source documents.
    
    Rules:
    - Keep the core technical structure of the blueprint.
    - Inject specific business terminology, naming conventions, and constraints found in the sources.
    - If the source mentions a specific user flow (e.g., "The customer must verify their VAT number"), ensure that is integrated.
    - Output ONLY the rewritten prompt text. No preamble.
  `;

  const userPrompt = `
    Blueprint Name: ${blueprintName}
    Base Template: ${basePrompt}
    
    Source Documents Context:
    ${sourcesSummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || basePrompt;
  } catch (error) {
    console.error("Contextualization failed:", error);
    return basePrompt; // Fallback to static
  }
};

export const optimizePrompt = async (
  rawPrompt: string,
  config: PromptConfig
): Promise<OptimizationResult> => {
  const sourcesContext = config.sources.length > 0 
    ? `
    The following PROJECT DOCUMENTS have been provided as primary context. 
    Strictly adhere to the business logic, style guides, and constraints defined within them:
    ${config.sources.map(s => `--- DOCUMENT: ${s.name} ---\n${s.content}\n--- END DOCUMENT ---`).join('\n\n')}
    `
    : '';

  const systemInstruction = `
    You are a world-class Senior Software Architect and Prompt Engineer specializing in modern web development.
    Your goal is to take a "raw" user requirement and transform it into a highly detailed, professional-grade technical prompt that can be used to generate production-quality code from an AI.

    ${sourcesContext}

    Technical Strategy Constraints:
    - Clean architecture and SOLID principles.
    - Modern frameworks: ${config.framework}.
    - Styling: ${config.styling}.
    - Backend/Self-hostable services: ${config.backend}.
    - Tooling: ${config.tooling.join(', ')}.
    - Messaging Infrastructure: ${config.providers.length > 0 ? config.providers.join(', ') : 'None specified'}.
    
    Implementation Focus for Messaging:
    - If Novu is selected, focus on workflow-based notifications and in-app feeds.
    - If Twilio is selected, ensure robust SMS handling and rate-limiting.
    - If OneSignal is selected, focus on service worker registration and push token management.
    - If Resend is selected, focus on high-fidelity transactional emails with React Email templates.

    The output MUST be a JSON object with three keys:
    1. "optimizedPrompt": The full, detailed prompt for the AI.
    2. "architectureNotes": Brief technical decisions made.
    3. "suggestedStack": A summary list of the technologies included.
  `;

  const userContent = `
    Requirement: "${rawPrompt}"
    Additional User Context: ${config.customContext || 'None'}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userContent,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: { type: Type.STRING },
            architectureNotes: { type: Type.STRING },
            suggestedStack: { type: Type.STRING }
          },
          required: ["optimizedPrompt", "architectureNotes", "suggestedStack"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Optimization failed:", error);
    throw new Error("Failed to optimize prompt. Please try again.");
  }
};
