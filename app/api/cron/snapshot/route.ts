import { NextRequest, NextResponse } from 'next/server';
import { captureSnapshot } from '@/services/taskService';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allProjects = await db.select({ id: projects.id }).from(projects);

    for (const project of allProjects) {
      await captureSnapshot(project.id);
    }

    return NextResponse.json({
      success: true,
      message: `Captured snapshots for ${allProjects.length} projects`,
    });
  } catch (error) {
    console.error('Snapshot cron error:', error);
    return NextResponse.json(
      { error: 'Failed to capture snapshots' },
      { status: 500 }
    );
  }
}
