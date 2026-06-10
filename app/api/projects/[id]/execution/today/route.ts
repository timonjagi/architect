import { NextRequest, NextResponse } from 'next/server';
import { getTodayFocus } from '@/services/taskService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    const tasks = await getTodayFocus(projectId, limit);

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get today focus error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today focus' },
      { status: 500 }
    );
  }
}
