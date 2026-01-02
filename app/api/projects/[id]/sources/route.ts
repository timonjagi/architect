import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectSources, projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, params.id), eq(projects.userId, user.id)),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const sources = await db.query.projectSources.findMany({
      where: eq(projectSources.projectId, params.id),
    });

    return NextResponse.json(sources);
  } catch (error) {
    console.error("Failed to fetch sources:", error);
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, params.id), eq(projects.userId, user.id)),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const [newSource] = await db.insert(projectSources).values({
      projectId: params.id,
      fileName: body.fileName,
      fileType: body.fileType,
      content: body.content,
      size: body.size,
    }).returning();

    return NextResponse.json(newSource);
  } catch (error) {
    console.error("Failed to add source:", error);
    return NextResponse.json({ error: "Failed to add source" }, { status: 500 });
  }
}
