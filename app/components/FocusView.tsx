'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Play, Pause, Trophy, Flame,
  RefreshCcw, Timer, ArrowRight, PartyPopper
} from 'lucide-react';
import { toast } from 'sonner';
import type { ExecutionTask, TaskStatus, TaskPriority } from '@/types';

interface FocusViewProps {
  projectId: string;
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  p0: { label: 'P0', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  p1: { label: 'P1', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  p2: { label: 'P2', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  p3: { label: 'P3', color: 'text-slate-500 bg-slate-600/10 border-slate-600/20' },
};

export function FocusView({ projectId }: FocusViewProps) {
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFocusTasks = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/execution/today?limit=3`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch focus tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFocusTasks();
  }, [projectId]);

  useEffect(() => {
    if (activeTimer) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
        if (newStatus === 'done') {
          setCompletedIds(prev => new Set(prev).add(taskId));
          toast.success('Task completed!');
          if (activeTimer === taskId) {
            setActiveTimer(null);
            setElapsed(0);
          }
        }
        fetchFocusTasks();
      }
    } catch (error) {
      console.error('Failed to transition task:', error);
    }
  };

  const toggleTimer = (taskId: string) => {
    if (activeTimer === taskId) {
      setActiveTimer(null);
      setElapsed(0);
    } else {
      setActiveTimer(taskId);
      setElapsed(0);
    }
  };

  const completedCount = tasks.filter(t => t.status === 'done' || completedIds.has(t.id)).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCcw className="w-6 h-6 text-slate-600 animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
        <Trophy className="w-12 h-12 text-slate-800 mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No focus tasks</p>
        <p className="text-xs text-slate-600 mt-2">Import tasks or start working to see your focus</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Today&apos;s Focus</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        {activeTimer && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
            <Timer className="w-4 h-4 text-white animate-pulse" />
            <span className="text-lg font-black text-white font-mono">{formatTime(elapsed)}</span>
          </div>
        )}
      </div>

      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {completedCount === totalCount && (
        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg animate-in fade-in">
          <PartyPopper className="w-6 h-6 text-white" />
          <div>
            <p className="text-sm font-black text-white">All done for today!</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Great work — {totalCount} tasks completed
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <FocusTaskCard
            key={task.id}
            task={task}
            index={index}
            isActive={activeTimer === task.id}
            onToggleTimer={() => toggleTimer(task.id)}
            onStatusChange={handleStatusChange}
            isCompleted={task.status === 'done' || completedIds.has(task.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface FocusTaskCardProps {
  task: ExecutionTask;
  index: number;
  isActive: boolean;
  onToggleTimer: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isCompleted: boolean;
}

function FocusTaskCard({ task, index, isActive, onToggleTimer, onStatusChange, isCompleted }: FocusTaskCardProps) {
  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    todo: 'in_progress',
    in_progress: 'done',
    blocked: 'in_progress',
    done: null,
  };

  return (
    <div className={`bg-slate-900/50 border rounded-lg p-4 transition-all ${
      isCompleted ? 'border-emerald-500/20 opacity-60' : isActive ? 'border-white/20 bg-white/5' : 'border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
          isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-white'
        }`}>
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${priorityConfig[task.priority].color}`}>
              {priorityConfig[task.priority].label}
            </span>
            {task.estimateMinutes && (
              <span className="text-[10px] text-slate-500 font-bold">
                ~{task.estimateMinutes}min
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isCompleted && task.status !== 'done' && (
            <>
              <button
                onClick={onToggleTimer}
                className={`p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'
                }`}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onStatusChange(task.id, nextStatus[task.status]!)}
                className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
