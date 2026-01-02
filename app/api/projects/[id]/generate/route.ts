import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, projectSpecs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, params.id),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // This is a placeholder for the actual Gemini generation logic.
    // In a real application, you would pass the project configuration to Gemini
    // and stream the result back to the client.

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate a technical specification for a project named "${project.name}" with the following description: "${project.description}". 
    Framework: ${project.framework}, Styling: ${project.styling}, Backend: ${project.backend}.
    Return the response in JSON format matching the project_specs table schema.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Simple JSON extraction (this might need to be more robust)
    let specData;
    try {
      specData = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
    } catch (e) {
      specData = {
        title: `${project.name} Specification`,
        coldStartGuide: text,
      };
    }

    const [newSpec] = await db.insert(projectSpecs).values({
      projectId: project.id,
      version: "1.0.0", // Logic for incrementing version would go here
      title: specData.title || `${project.name} Spec`,
      coldStartGuide: specData.coldStartGuide || "",
      directoryStructure: specData.directoryStructure || {},
      frameworkDetails: specData.frameworkDetails || {},
      stylingDetails: specData.stylingDetails || {},
      backendDetails: specData.backendDetails || {},
      implementationPlan: specData.implementationPlan || {},
      tasks: specData.tasks || [],
    }).returning();

    return NextResponse.json(newSpec);
  } catch (error) {
    console.error("Failed to generate spec:", error);
    return NextResponse.json({ error: "Failed to generate spec" }, { status: 500 });
  }
}
