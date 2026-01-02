import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectSources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
