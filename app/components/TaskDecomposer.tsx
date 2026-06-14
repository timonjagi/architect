'use client';

import React, { useState } from 'react';
import { Layers, RefreshCcw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { decomposeSchema } from '@/lib/ai-schemas';

interface TaskDecomposerProps {
  taskId: string;
  onImported?: () => void;
}

export function TaskDecomposer({ taskId, onImported }: TaskDecomposerProps) {
  const [importing, setImporting] = useState(false);

  const {
    object: result,
    isLoading,
    submit,
  } = useObject({
    api: `/api/tasks/${taskId}/decompose`,
    schema: decomposeSchema,
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to decompose task');
    },
  });

  const handleImport = async () => {
    if (!result?.subtasks) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/decompose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ import: true, subtasks: result.subtasks }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Imported ${(result.subtasks || []).length} subtasks`);
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

  const subtasks = result?.subtasks || [];

  return (
    <div className="space-y-3">
      {!result && (
        <button
          onClick={() => submit({})}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-[10px] font-bold text-white hover:bg-white/20 transition-colors disabled:opacity-50 w-full justify-center"
        >
          {isLoading ? (
            <RefreshCcw className="w-3 h-3 animate-spin" />
          ) : (
            <Layers className="w-3 h-3" />
          )}
          {isLoading ? 'Decomposing...' : 'Decompose into Subtasks'}
        </button>
      )}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {subtasks.length} Subtasks
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => {}}
                className="px-2 py-1 text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || subtasks.length === 0}
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

          {subtasks.map((sub: any, i: number) => (
            <div
              key={i}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{sub.title || '...'}</p>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {sub.description || '...'}
                  </p>
                </div>
                <span className="text-[8px] font-black text-slate-500 shrink-0">
                  ~{sub.estimateMinutes || '...'}min
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}