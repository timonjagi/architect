import { NextRequest, NextResponse } from 'next/server';
import { aiGenerateStandup } from '@/lib/ai-standup';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const result = await aiGenerateStandup(projectId);
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI standup error:', error);
    return NextResponse.json(
      { error: 'Failed to generate standup' },
      { status: 500 }
    );
  }
}