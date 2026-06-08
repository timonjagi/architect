import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '@/services/taskService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const analytics = await getAnalytics(projectId);
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
