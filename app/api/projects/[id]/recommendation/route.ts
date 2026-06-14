import { NextRequest, NextResponse } from 'next/server';
import { aiRecommendNextTask } from '@/lib/ai-recommendations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const result = await aiRecommendNextTask(projectId);
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}