import { NextRequest, NextResponse } from 'next/server';
import { blockTask, getTaskById } from '@/services/taskService';
import type { BlockerType } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const taskId = params.taskId;
    const body = await request.json();
    const { type, details, createdBy } = body;

    if (!type || !details) {
      return NextResponse.json(
        { error: 'type and details are required' },
        { status: 400 }
      );
    }

    const validTypes: BlockerType[] = ['technical', 'scope', 'dependency', 'external'];
    if (!validTypes.includes(type as BlockerType)) {
      return NextResponse.json(
        { error: 'Invalid blocker type' },
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

    await blockTask(taskId, type as BlockerType, details, createdBy);

    return NextResponse.json({
      success: true,
      message: 'Task blocked successfully',
    });
  } catch (error) {
    console.error('Block task error:', error);
    return NextResponse.json(
      { error: 'Failed to block task' },
      { status: 500 }
    );
  }
}
