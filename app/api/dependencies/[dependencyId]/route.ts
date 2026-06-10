import { NextRequest, NextResponse } from 'next/server';
import { removeDependency } from '@/services/taskService';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dependencyId: string }> }
) {
  try {
    const { dependencyId } = await params;
    const removed = await removeDependency(dependencyId);
    if (!removed) {
      return NextResponse.json(
        { error: 'Dependency not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Dependency removed' });
  } catch (error) {
    console.error('Remove dependency error:', error);
    return NextResponse.json(
      { error: 'Failed to remove dependency' },
      { status: 500 }
    );
  }
}
