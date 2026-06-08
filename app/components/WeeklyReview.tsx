'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCcw, TrendingUp, TrendingDown, CheckCircle2, Ban,
  AlertTriangle, Clock, Plus, ArrowUpRight, BarChart3
} from 'lucide-react';
import type { WeeklyReview as WeeklyReviewData } from '@/services/taskService';

interface WeeklyReviewProps {
  projectId: string;
}

export function WeeklyReview({ projectId }: WeeklyReviewProps) {
  const [review, setReview] = useState<WeeklyReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeksBack, setWeeksBack] = useState(0);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/review?weeks=${weeksBack}`
      );
      const data = await res.json();
      if (data.success) {
        setReview(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch review:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [projectId, weeksBack]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCcw className="w-6 h-6 text-slate-600 animate-spin" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
        <BarChart3 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
          No review data
        </p>
      </div>
    );
  }

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Weekly Review
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {formatDate(review.period.from)} — {formatDate(review.period.to)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeeksBack((w) => w + 1)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            ← Previous Week
          </button>
          {weeksBack > 0 && (
            <button
              onClick={() => setWeeksBack(0)}
              className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-[10px] font-bold text-white hover:bg-white/20 transition-colors"
            >
              Current
            </button>
          )}
        </div>
      </div>

      {review.highlights.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Highlights
          </h4>
          <div className="space-y-2">
            {review.highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
              >
                <ArrowUpRight className="w-3 h-3 text-white shrink-0" />
                <span className="text-xs text-white font-bold">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Tasks Completed"
          value={review.activity.completed}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
        <StatCard
          label="Tasks Created"
          value={review.activity.created}
          icon={<Plus className="w-4 h-4 text-blue-400" />}
        />
        <StatCard
          label="Blocked"
          value={review.activity.blocked}
          icon={<Ban className="w-4 h-4 text-red-400" />}
        />
        <StatCard
          label="Unblocked"
          value={review.activity.unblocked}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Current State
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StateCard label="Total" value={review.tasks.total} />
          <StateCard label="Done" value={review.tasks.completed} color="text-emerald-400" />
          <StateCard label="In Progress" value={review.tasks.inProgress} color="text-blue-400" />
          <StateCard label="Blocked" value={review.tasks.blocked} color="text-red-400" />
          <StateCard label="To Do" value={review.tasks.todo} color="text-slate-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Completion Rate
            </span>
            <span className="text-xs font-black text-white">
              {review.tasks.completionRate}%
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${review.tasks.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {review.velocity.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Velocity Trend
          </h4>
          <div className="flex items-end gap-1 h-20">
            {review.velocity.map((v, i) => {
              const max = Math.max(...review.velocity);
              const height = max > 0 ? (v / max) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-white/20 rounded-t"
                  style={{ height: `${height}%` }}
                  title={`${v} tasks`}
                />
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500 font-bold">
            Avg: {(review.velocity.reduce((a, b) => a + b, 0) / review.velocity.length).toFixed(1)} tasks/snapshot
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Activity Summary
        </h4>
        <div className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 leading-relaxed">
            {review.activity.total === 0
              ? 'No activity recorded this period.'
              : `This week saw ${review.activity.total} activity events: ${review.activity.completed} completions, ${review.activity.blocked} blocks, ${review.activity.unblocked} unblocks, and ${review.activity.created} new tasks.`}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function StateCard({
  label,
  value,
  color = 'text-white',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
      <p className={`text-lg font-black ${color}`}>{value}</p>
      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}
