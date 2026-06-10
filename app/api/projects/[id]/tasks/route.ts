import { NextRequest, NextResponse } from 'next/server';
import { getProjectTasks } from '@/services/taskService';
import type { TaskStatus } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TaskStatus | null;

    const tasks = await getProjectTasks(projectId, status || undefined);

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
