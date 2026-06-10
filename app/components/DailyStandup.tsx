'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCcw, CheckCircle2, Ban, ArrowRight, ClipboardList, ChevronDown, ChevronUp
} from 'lucide-react';
import type { DailyStandup as StandupData } from '@/lib/ai-standup';

interface DailyStandupProps {
  projectId: string;
}

export function DailyStandup({ projectId }: DailyStandupProps) {
  const [standup, setStandup] = useState<StandupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const fetchStandup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/standup`);
      const data = await res.json();
      if (data.success) {
        setStandup(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch standup:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandup();
  }, [projectId]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            Daily Standup
          </span>
          {standup && (
            <span className="text-[10px] text-slate-500 font-bold ml-2">
              {standup.summary}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchStandup();
            }}
            disabled={loading}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {collapsed ? (
            <ChevronDown className="w-3 h-3 text-slate-500" />
          ) : (
            <ChevronUp className="w-3 h-3 text-slate-500" />
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {loading && !standup && (
            <div className="flex items-center justify-center py-6">
              <RefreshCcw className="w-5 h-5 text-slate-600 animate-spin" />
            </div>
          )}

          {standup && (
            <>
              {standup.yesterday.length > 0 && (
                <div>
                  <h5 className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">
                    Yesterday
                  </h5>
                  <div className="space-y-1">
                    {standup.yesterday.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-[11px] text-slate-300 font-bold">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {standup.today.length > 0 && (
                <div>
                  <h5 className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1.5">
                    Today
                  </h5>
                  <div className="space-y-1">
                    {standup.today.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <ArrowRight className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                        <span className="text-[11px] text-slate-300 font-bold">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {standup.blockers.length > 0 && (
                <div>
                  <h5 className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1.5">
                    Blockers
                  </h5>
                  <div className="space-y-1">
                    {standup.blockers.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Ban className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                        <span className="text-[11px] text-slate-300 font-bold">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {standup.yesterday.length === 0 && standup.today.length === 0 && standup.blockers.length === 0 && (
                <p className="text-xs text-slate-500 font-bold text-center py-4">
                  No standup data available. Start working to see your daily summary.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
