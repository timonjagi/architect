import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectSpecs, projects } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
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

    const specs = await db.query.projectSpecs.findMany({
      where: eq(projectSpecs.projectId, params.id),
      orderBy: [desc(projectSpecs.createdAt)],
    });

    return NextResponse.json(specs);
  } catch (error) {
    console.error("Failed to fetch specs:", error);
    return NextResponse.json({ error: "Failed to fetch specs" }, { status: 500 });
  }
}
