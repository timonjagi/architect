import { NextRequest, NextResponse } from 'next/server';
import { aiDecomposeTask } from '@/lib/ai-decompose';
import { importSubtasks } from '@/services/taskService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json().catch(() => ({}));

    if (body.import && body.subtasks) {
      const imported = await importSubtasks(taskId, body.subtasks);
      return NextResponse.json({ success: true, data: { imported: imported.length } });
    }

    const result = await aiDecomposeTask(taskId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AI decompose error:', error);
    return NextResponse.json(
      { error: 'Failed to decompose task' },
      { status: 500 }
    );
  }
}
