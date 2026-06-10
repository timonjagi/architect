import { NextRequest, NextResponse } from 'next/server';
import { importTasksFromSpec } from '@/services/taskService';
import { db } from '@/lib/db';
import { projectSpecs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { specId } = body;

    if (!specId) {
      return NextResponse.json(
        { error: 'specId is required' },
        { status: 400 }
      );
    }

    const [spec] = await db
      .select()
      .from(projectSpecs)
      .where(eq(projectSpecs.id, specId))
      .limit(1);

    if (!spec) {
      return NextResponse.json(
        { error: 'Spec not found' },
        { status: 404 }
      );
    }

    const specTasks = (spec.tasks as any[]) || [];
    if (specTasks.length === 0) {
      return NextResponse.json(
        { error: 'No tasks found in spec' },
        { status: 400 }
      );
    }

    const result = await importTasksFromSpec(projectId, specId, specTasks);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Import tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to import tasks' },
      { status: 500 }
    );
  }
}
