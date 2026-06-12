import { NextRequest, NextResponse } from 'next/server';
import { optimizePrompt } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: 'Missing config' }, { status: 400 });
    }

    const result = await optimizePrompt(config.rawPrompt || 'Generate spec', config);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Spec generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate specification' },
      { status: 500 }
    );
  }
}