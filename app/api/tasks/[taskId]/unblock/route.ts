import { NextRequest, NextResponse } from 'next/server';
import { unblockTask, getTaskById } from '@/services/taskService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const existingTask = await getTaskById(taskId);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    await unblockTask(taskId);

    return NextResponse.json({
      success: true,
      message: 'Task unblocked successfully',
    });
  } catch (error) {
    console.error('Unblock task error:', error);
    return NextResponse.json(
      { error: 'Failed to unblock task' },
      { status: 500 }
    );
  }
}
