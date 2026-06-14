'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCcw, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { recommendationSchema } from '@/lib/ai-schemas';

interface NextTaskRecommendationProps {
  projectId: string;
}

export function NextTaskRecommendation({ projectId }: NextTaskRecommendationProps) {
  const [clicked, setClicked] = useState(false);

  const {
    object: recommendation,
    isLoading,
    submit,
  } = useObject({
    api: `/api/projects/${projectId}/recommendation`,
    schema: recommendationSchema,
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to get recommendation');
    },
  });

  const handleStartTask = async () => {
    if (!recommendation?.taskId) return;
    try {
      const res = await fetch(`/api/tasks/${recommendation.taskId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Started: ${recommendation.title}`);
        setClicked(false);
      }
    } catch {
      toast.error('Failed to start task');
    }
  };

  const loading = isLoading || (!clicked && !recommendation);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            AI Recommendation
          </span>
        </div>
        <button
          onClick={() => { setClicked(true); submit({}); }}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded text-[10px] font-bold text-white hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCcw className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {isLoading ? 'Analyzing...' : recommendation ? 'Refresh' : 'Get Recommendation'}
        </button>
      </div>

      {!recommendation && !loading && !clicked && (
        <p className="text-xs text-slate-500 font-bold">
          Click &quot;Get Recommendation&quot; to let AI suggest what to work on next.
        </p>
      )}

      {recommendation && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-white">{recommendation.title || '...'}</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              {recommendation.rationale || '...'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
              <Clock className="w-3 h-3" />
              ~{recommendation.estimatedMinutes || '...'}min
            </div>
            {recommendation.blockers && recommendation.blockers.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                <AlertTriangle className="w-3 h-3" />
                {recommendation.blockers.length} blocker{recommendation.blockers.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {recommendation.prerequisites && recommendation.prerequisites.length > 0 && (
            <div className="text-[10px] text-slate-500 font-bold">
              Prerequisites: {recommendation.prerequisites.join(', ')}
            </div>
          )}

          <button
            onClick={handleStartTask}
            disabled={!recommendation.taskId || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-950 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Start Task
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}