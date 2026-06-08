import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyReview } from '@/services/taskService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const weeksBack = parseInt(searchParams.get('weeks') || '0', 10);

    const review = await getWeeklyReview(projectId, weeksBack);
    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Get weekly review error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly review' },
      { status: 500 }
    );
  }
}
