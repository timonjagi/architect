'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  AlertTriangle, RefreshCcw, Trash2, Plus, CheckCircle2, Circle,
  Ban, Play
} from 'lucide-react';
import { toast } from 'sonner';
import type { ExecutionTask, TaskDependency, TaskStatus, TaskPriority } from '@/types';

interface DependencyGraphProps {
  projectId: string;
}

const statusColors: Record<TaskStatus, string> = {
  todo: '#64748b',
  in_progress: '#3b82f6',
  blocked: '#ef4444',
  done: '#10b981',
};

const priorityColors: Record<TaskPriority, string> = {
  p0: '#ef4444',
  p1: '#f59e0b',
  p2: '#64748b',
  p3: '#475569',
};

function detectCycle(edges: Edge[]): string[][] {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(node: string, path: string[]): boolean {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    for (const neighbor of adj.get(node) || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, path)) return true;
      } else if (recStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
        return true;
      }
    }

    path.pop();
    recStack.delete(node);
    return false;
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

function computeCriticalPath(
  tasks: ExecutionTask[],
  edges: Edge[]
): Set<string> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.target)!.push(e.source);
  }

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const memo = new Map<string, { length: number; path: string[] }>();

  function dfs(
    nodeId: string
  ): { length: number; path: string[] } {
    if (memo.has(nodeId)) return memo.get(nodeId)!;

    const task = taskMap.get(nodeId);
    const duration = task?.estimateMinutes || 30;

    let bestNext = { length: 0, path: [] as string[] };
    for (const dep of adj.get(nodeId) || []) {
      const result = dfs(dep);
      if (result.length > bestNext.length) {
        bestNext = result;
      }
    }

    const result = {
      length: duration + bestNext.length,
      path: [nodeId, ...bestNext.path],
    };
    memo.set(nodeId, result);
    return result;
  }

  const allTaskIds = new Set(tasks.map((t) => t.id));
  const targetIds = new Set(
    edges.filter((e) => allTaskIds.has(e.target)).map((e) => e.target)
  );
  const roots = tasks.filter((t) => !targetIds.has(t.id));

  let criticalPath: string[] = [];
  let maxLen = 0;
  for (const root of roots) {
    const result = dfs(root.id);
    if (result.length > maxLen) {
      maxLen = result.length;
      criticalPath = result.path;
    }
  }

  return new Set(criticalPath);
}

function computeLayout(
  tasks: ExecutionTask[],
  edges: Edge[]
): Map<string, { x: number; y: number }> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.target)!.push(e.source);
  }

  const allTaskIds = new Set(tasks.map((t) => t.id));
  const targetIds = new Set(
    edges.filter((e) => allTaskIds.has(e.target)).map((e) => e.target)
  );
  const roots = tasks.filter((t) => !targetIds.has(t.id));

  const layerMap = new Map<string, number>();

  function assignLayer(nodeId: string, layer: number) {
    if (layerMap.has(nodeId) && layerMap.get(nodeId)! >= layer) return;
    layerMap.set(nodeId, layer);
    for (const dep of adj.get(nodeId) || []) {
      assignLayer(dep, layer + 1);
    }
  }

  for (const root of roots) {
    assignLayer(root.id, 0);
  }

  for (const task of tasks) {
    if (!layerMap.has(task.id)) {
      assignLayer(task.id, 0);
    }
  }

  const layers = new Map<number, string[]>();
  for (const [nodeId, layer] of layerMap) {
    if (!layers.has(layer)) layers.set(layer, []);
    layers.get(layer)!.push(nodeId);
  }

  const positions = new Map<string, { x: number; y: number }>();
  const LAYER_WIDTH = 250;
  const NODE_HEIGHT = 80;

  for (const [layer, nodeIds] of layers) {
    const totalHeight = nodeIds.length * NODE_HEIGHT;
    const startY = -totalHeight / 2;
    nodeIds.forEach((nodeId, index) => {
      positions.set(nodeId, {
        x: layer * LAYER_WIDTH,
        y: startY + index * NODE_HEIGHT,
      });
    });
  }

  return positions;
}

export function DependencyGraph({ projectId }: DependencyGraphProps) {
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSource, setAddSource] = useState<string>('');
  const [addTarget, setAddTarget] = useState<string>('');

  const fetchData = async () => {
    try {
      const [tasksRes, depsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/tasks`),
        fetch(`/api/projects/${projectId}/dependencies`),
      ]);
      const [tasksData, depsData] = await Promise.all([
        tasksRes.json(),
        depsRes.json(),
      ]);
      if (tasksData.success) setTasks(tasksData.data);
      if (depsData.success) setDependencies(depsData.data);
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const cycles = useMemo(
    () =>
      detectCycle(
        dependencies.map((d) => ({
          id: d.id,
          source: d.dependsOnTaskId,
          target: d.taskId,
        }))
      ),
    [dependencies]
  );

  const criticalPath = useMemo(
    () =>
      computeCriticalPath(
        tasks,
        dependencies.map((d) => ({
          id: d.id,
          source: d.dependsOnTaskId,
          target: d.taskId,
        }))
      ),
    [tasks, dependencies]
  );

  const positions = useMemo(
    () =>
      computeLayout(
        tasks,
        dependencies.map((d) => ({
          id: d.id,
          source: d.dependsOnTaskId,
          target: d.taskId,
        }))
      ),
    [tasks, dependencies]
  );

  const initialNodes: Node[] = useMemo(
    () =>
      tasks.map((task) => ({
        id: task.id,
        position: positions.get(task.id) || { x: 0, y: 0 },
        data: { label: task.title, status: task.status, priority: task.priority },
        style: {
          background: criticalPath.has(task.id)
            ? 'rgba(255,255,255,0.1)'
            : 'rgb(15 23 42)',
          border: `1px solid ${
            criticalPath.has(task.id)
              ? '#f59e0b'
              : cycles.some((c) => c.includes(task.id))
                ? '#ef4444'
                : 'rgb(30 41 59)'
          }`,
          borderRadius: '8px',
          padding: '8px 12px',
          minWidth: 140,
        },
      })),
    [tasks, positions, criticalPath, cycles]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      dependencies.map((dep) => ({
        id: dep.id,
        source: dep.dependsOnTaskId,
        target: dep.taskId,
        type: 'smoothstep',
        animated: cycles.some(
          (c) => c.includes(dep.taskId) && c.includes(dep.dependsOnTaskId)
        ),
        style: {
          stroke: cycles.some(
            (c) => c.includes(dep.taskId) && c.includes(dep.dependsOnTaskId)
          )
            ? '#ef4444'
            : '#475569',
          strokeWidth: 2,
        },
      })),
    [dependencies, cycles]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleAddDependency = async () => {
    if (!addSource || !addTarget) return;
    if (addSource === addTarget) {
      toast.error('Task cannot depend on itself');
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: addSource, dependsOnTaskId: addTarget }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Dependency added');
        setShowAddModal(false);
        setAddSource('');
        setAddTarget('');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to add dependency');
      }
    } catch {
      toast.error('Failed to add dependency');
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      const res = await fetch(`/api/dependencies/${dependencyId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Dependency removed');
        fetchData();
      }
    } catch {
      toast.error('Failed to remove dependency');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCcw className="w-6 h-6 text-slate-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Dependency Graph
        </h3>
        <div className="flex items-center gap-2">
          {cycles.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-bold text-red-400">
              <AlertTriangle className="w-3 h-3" />
              {cycles.length} cycle{cycles.length > 1 ? 's' : ''} detected
            </div>
          )}
          {criticalPath.size > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-bold text-amber-400">
              <CheckCircle2 className="w-3 h-3" />
              Critical path: {criticalPath.size} tasks
            </div>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-[10px] font-bold text-white hover:bg-white/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>

      <div className="h-[500px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background color="#334155" gap={16} />
          <Controls className="!bg-slate-800 !border-slate-700 !rounded-lg" />
          <MiniMap
            nodeColor={(node) =>
              statusColors[node.data.status as TaskStatus] || '#64748b'
            }
            maskColor="rgba(0,0,0,0.7)"
            className="!bg-slate-900 !border-slate-800"
          />
        </ReactFlow>
      </div>

      <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500">
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2 fill-slate-500" /> To Do
        </div>
        <div className="flex items-center gap-1">
          <Play className="w-2 h-2 fill-blue-500" /> In Progress
        </div>
        <div className="flex items-center gap-1">
          <Ban className="w-2 h-2 fill-red-500" /> Blocked
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-2 h-2 fill-emerald-500" /> Done
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-amber-500 rounded" /> Critical Path
        </div>
      </div>

      {dependencies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Dependencies
          </h4>
          {dependencies.map((dep) => {
            const sourceTask = tasks.find((t) => t.id === dep.dependsOnTaskId);
            const targetTask = tasks.find((t) => t.id === dep.taskId);
            return (
              <div
                key={dep.id}
                className="flex items-center justify-between px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-bold text-white">
                    {sourceTask?.title || 'Unknown'}
                  </span>
                  <span className="text-slate-600">blocks</span>
                  <span className="font-bold text-white">
                    {targetTask?.title || 'Unknown'}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveDependency(dep.id)}
                  className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Add Dependency
            </h3>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                Task (blocked by)
              </label>
              <select
                value={addSource}
                onChange={(e) => setAddSource(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-sm rounded px-3 py-2"
              >
                <option value="">Select task...</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                Depends on
              </label>
              <select
                value={addTarget}
                onChange={(e) => setAddTarget(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-sm rounded px-3 py-2"
              >
                <option value="">Select prerequisite...</option>
                {tasks
                  .filter((t) => t.id !== addSource)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddSource('');
                  setAddTarget('');
                }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDependency}
                disabled={!addSource || !addTarget}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded text-sm font-bold uppercase disabled:opacity-50"
              >
                Add Dependency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
