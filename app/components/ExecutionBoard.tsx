'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Filter,
  RefreshCcw, Plus, ChevronDown, ChevronUp, MoreHorizontal,
  ArrowRight, Play, Pause, Ban, Trash2, Edit2, Eye
} from 'lucide-react';
import type { ExecutionTask, TaskStatus, TaskPriority, BlockerType } from '@/types';

interface ExecutionBoardProps {
  projectId: string;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  todo: { label: 'To Do', color: 'text-slate-400 bg-slate-800/50', icon: <Circle className="w-4 h-4" /> },
  in_progress: { label: 'In Progress', color: 'text-blue-400 bg-blue-500/10', icon: <Play className="w-4 h-4" /> },
  blocked: { label: 'Blocked', color: 'text-red-400 bg-red-500/10', icon: <Ban className="w-4 h-4" /> },
  done: { label: 'Done', color: 'text-emerald-400 bg-emerald-500/10', icon: <CheckCircle2 className="w-4 h-4" /> },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  p0: { label: 'P0', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  p1: { label: 'P1', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  p2: { label: 'P2', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  p3: { label: 'P3', color: 'text-slate-500 bg-slate-600/10 border-slate-600/20' },
};

const blockerTypes: BlockerType[] = ['technical', 'scope', 'dependency', 'external'];

export function ExecutionBoard({ projectId }: ExecutionBoardProps) {
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showBlockerModal, setShowBlockerModal] = useState<string | null>(null);
  const [blockerType, setBlockerType] = useState<BlockerType>('technical');
  const [blockerDetails, setBlockerDetails] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchTasks = async () => {
    try {
      const url = filterStatus === 'all'
        ? `/api/projects/${projectId}/tasks`
        : `/api/projects/${projectId}/tasks?status=${filterStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, filterStatus]);

  const handleImportFromSpec = async (specId: string) => {
    setImporting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to import tasks:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to transition task:', error);
    }
  };

  const handleBlockTask = async () => {
    if (!showBlockerModal || !blockerDetails.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${showBlockerModal}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: blockerType, details: blockerDetails }),
      });
      const data = await res.json();
      if (data.success) {
        setShowBlockerModal(null);
        setBlockerDetails('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to block task:', error);
    }
  };

  const handleUnblockTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/unblock`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to unblock task:', error);
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    blocked: tasks.filter(t => t.status === 'blocked'),
    done: tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Execution Board</h3>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className="bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 rounded px-2 py-1.5 uppercase"
          >
            <option value="all">All Tasks</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <button
            onClick={fetchTasks}
            className="p-2 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
          >
            <RefreshCcw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCcw className="w-6 h-6 text-slate-600 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
          <Circle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No tasks yet</p>
          <p className="text-xs text-slate-600 mt-2">Import tasks from a spec to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(tasksByStatus) as TaskStatus[]).map(status => (
            <div key={status} className="space-y-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusConfig[status].color}`}>
                {statusConfig[status].icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{statusConfig[status].label}</span>
                <span className="ml-auto text-[10px] font-bold opacity-60">{tasksByStatus[status].length}</span>
              </div>
              <div className="space-y-2">
                {tasksByStatus[status].map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    expanded={expandedTask === task.id}
                    onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    onStatusChange={handleStatusChange}
                    onBlock={() => setShowBlockerModal(task.id)}
                    onUnblock={() => handleUnblockTask(task.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showBlockerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Block Task</h3>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Blocker Type</label>
              <select
                value={blockerType}
                onChange={(e) => setBlockerType(e.target.value as BlockerType)}
                className="w-full bg-slate-900 border border-slate-800 text-sm rounded px-3 py-2"
              >
                {blockerTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Details</label>
              <textarea
                value={blockerDetails}
                onChange={(e) => setBlockerDetails(e.target.value)}
                placeholder="What's blocking this task?"
                className="w-full bg-slate-900 border border-slate-800 text-sm rounded px-3 py-2 h-24 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowBlockerModal(null); setBlockerDetails(''); }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockTask}
                disabled={!blockerDetails.trim()}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm font-bold uppercase disabled:opacity-50"
              >
                Block Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: ExecutionTask;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onBlock: () => void;
  onUnblock: () => void;
}

function TaskCard({ task, expanded, onToggle, onStatusChange, onBlock, onUnblock }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    todo: 'in_progress',
    in_progress: 'done',
    blocked: 'in_progress',
    done: null,
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
      <div className="flex items-start gap-2">
        <button
          onClick={() => task.status !== 'done' && nextStatus[task.status] && onStatusChange(task.id, nextStatus[task.status]!)}
          className="mt-0.5 shrink-0"
        >
          {task.status === 'done' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Circle className="w-4 h-4 text-slate-600 hover:text-white transition-colors" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${priorityConfig[task.priority].color}`}>
            {priorityConfig[task.priority].label}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-slate-600 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-6 z-10 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 min-w-[120px]">
                {task.status === 'blocked' ? (
                  <button
                    onClick={() => { onUnblock(); setShowActions(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-slate-800"
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    onClick={() => { onBlock(); setShowActions(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-slate-800"
                  >
                    Block
                  </button>
                )}
                <button
                  onClick={() => setShowActions(false)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-800"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
          {task.estimateMinutes && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <Clock className="w-3 h-3" />
              <span>Est: {task.estimateMinutes}min</span>
              {task.actualMinutes && <span>• Actual: {task.actualMinutes}min</span>}
            </div>
          )}
          <div className="flex gap-1">
            {(Object.keys(statusConfig) as TaskStatus[]).map(status => (
              <button
                key={status}
                onClick={() => onStatusChange(task.id, status)}
                disabled={task.status === status}
                className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-colors ${
                  task.status === status
                    ? 'bg-white text-slate-950'
                    : 'bg-slate-800 text-slate-500 hover:text-white'
                }`}
              >
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
