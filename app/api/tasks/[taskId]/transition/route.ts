import { NextRequest, NextResponse } from 'next/server';
import { transitionTask, getTaskById } from '@/services/taskService';
import type { TaskStatus } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { status, actorId } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done'];
    if (!validStatuses.includes(status as TaskStatus)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const existingTask = await getTaskById(taskId);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const updated = await transitionTask(taskId, status as TaskStatus, actorId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Transition task error:', error);
    return NextResponse.json(
      { error: 'Failed to transition task' },
      { status: 500 }
    );
  }
}
