import { NextRequest, NextResponse } from 'next/server';
import { getExecutionSummary } from '@/services/taskService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const summary = await getExecutionSummary(projectId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get execution summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution summary' },
      { status: 500 }
    );
  }
}
