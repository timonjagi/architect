'use client';

import React, { useState } from 'react';
import { Layers, RefreshCcw, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { DecomposedSubtasks } from '@/lib/ai-decompose';

interface TaskDecomposerProps {
  taskId: string;
  onImported?: () => void;
}

export function TaskDecomposer({ taskId, onImported }: TaskDecomposerProps) {
  const [result, setResult] = useState<DecomposedSubtasks | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleDecompose = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/decompose`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        toast.error(data.error || 'Failed to decompose');
      }
    } catch {
      toast.error('Failed to decompose task');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!result) return;
    setImporting(true);
    try {
      // Import each subtask by creating it via the transition endpoint pattern
      // We'll use the existing task import mechanism
      const res = await fetch(`/api/tasks/${taskId}/decompose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ import: true, subtasks: result.subtasks }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Imported ${result.subtasks.length} subtasks`);
        setResult(null);
        onImported?.();
      } else {
        toast.error(data.error || 'Failed to import');
      }
    } catch {
      toast.error('Failed to import subtasks');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-3">
      {!result && (
        <button
          onClick={handleDecompose}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-[10px] font-bold text-white hover:bg-white/20 transition-colors disabled:opacity-50 w-full justify-center"
        >
          {loading ? (
            <RefreshCcw className="w-3 h-3 animate-spin" />
          ) : (
            <Layers className="w-3 h-3" />
          )}
          {loading ? 'Decomposing...' : 'Decompose into Subtasks'}
        </button>
      )}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {result.subtasks.length} Subtasks
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setResult(null)}
                className="px-2 py-1 text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Import
              </button>
            </div>
          </div>

          {result.subtasks.map((sub, i) => (
            <div
              key={i}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{sub.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {sub.description}
                  </p>
                </div>
                <span className="text-[8px] font-black text-slate-500 shrink-0">
                  ~{sub.estimateMinutes}min
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
