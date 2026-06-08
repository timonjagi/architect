import { NextRequest, NextResponse } from 'next/server';
import { getProjectDependencies, addDependency } from '@/services/taskService';
import { getTaskById } from '@/services/taskService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const dependencies = await getProjectDependencies(projectId);
    return NextResponse.json({ success: true, data: dependencies });
  } catch (error) {
    console.error('Get dependencies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dependencies' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { taskId, dependsOnTaskId } = body;

    if (!taskId || !dependsOnTaskId) {
      return NextResponse.json(
        { error: 'taskId and dependsOnTaskId are required' },
        { status: 400 }
      );
    }

    if (taskId === dependsOnTaskId) {
      return NextResponse.json(
        { error: 'Task cannot depend on itself' },
        { status: 400 }
      );
    }

    const task = await getTaskById(taskId);
    const dependsOn = await getTaskById(dependsOnTaskId);

    if (!task || !dependsOn) {
      return NextResponse.json(
        { error: 'One or both tasks not found' },
        { status: 404 }
      );
    }

    if (task.projectId !== projectId || dependsOn.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Tasks must belong to this project' },
        { status: 400 }
      );
    }

    const dependency = await addDependency(taskId, dependsOnTaskId);
    return NextResponse.json({ success: true, data: dependency });
  } catch (error) {
    console.error('Add dependency error:', error);
    return NextResponse.json(
      { error: 'Failed to add dependency' },
      { status: 500 }
    );
  }
}
