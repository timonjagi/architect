import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectSpecs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
