import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allProjects = await db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)],
    });
    return NextResponse.json(allProjects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [newProject] = await db.insert(projects).values({
      name: body.name || "Untitled Project",
      userId: body.userId || "00000000-0000-0000-0000-000000000000", // Default or from auth
      status: "draft",
    }).returning();
    return NextResponse.json(newProject);
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
