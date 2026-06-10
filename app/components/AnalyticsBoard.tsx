'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import {
  RefreshCcw, TrendingUp, AlertTriangle, CheckCircle2,
  BarChart3, Gauge
} from 'lucide-react';
import type { AnalyticsData } from '@/services/taskService';

interface AnalyticsBoardProps {
  projectId: string;
}

export function AnalyticsBoard({ projectId }: AnalyticsBoardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/analytics`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCcw className="w-6 h-6 text-slate-600 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
        <BarChart3 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
          No analytics data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Analytics
        </h3>
        <button
          onClick={fetchAnalytics}
          className="p-2 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
        >
          <RefreshCcw className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Avg Velocity"
          value={`${analytics.summary.avgVelocity}`}
          unit="tasks/wk"
          icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
        />
        <MetricCard
          label="Avg Blocked"
          value={`${analytics.summary.avgBlockedDays}`}
          unit="days"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          label="Predictability"
          value={analytics.summary.currentPredictability !== null ? `${analytics.summary.currentPredictability}` : '—'}
          unit={analytics.summary.currentPredictability !== null ? '/100' : ''}
          icon={<Gauge className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          label="Currently Blocked"
          value={`${analytics.summary.totalBlocked}`}
          unit="tasks"
          icon={<CheckCircle2 className="w-4 h-4 text-red-400" />}
        />
      </div>

      {analytics.velocity.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Velocity — Tasks Completed Per Week
          </h4>
          <div className="h-[200px] bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.velocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#1e293b' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                  {analytics.velocity.map((_, index) => (
                    <Cell key={index} fill="#ffffff" fillOpacity={0.2 + (index / analytics.velocity.length) * 0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {analytics.predictability.length > 0 && analytics.predictability.some(p => p.score !== null) && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Predictability Score Over Time
          </h4>
          <div className="h-[200px] bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.predictability}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#1e293b' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {analytics.blockedAging.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Blocked Task Aging
          </h4>
          <div className="h-[200px] bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.blockedAging}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#1e293b' }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="taskTitle"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#1e293b' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, _name: any, props: any) => [
                    `${value} days (${props.payload.blockerType})`,
                    'Blocked',
                  ]}
                />
                <Bar dataKey="daysBlocked" radius={[0, 4, 4, 0]}>
                  {analytics.blockedAging.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.daysBlocked < 2
                          ? '#10b981'
                          : entry.daysBlocked <= 5
                            ? '#f59e0b'
                            : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500" /> &lt;2 days
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-500" /> 2–5 days
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500" /> &gt;5 days
            </span>
          </div>
        </div>
      )}

      {analytics.velocity.length === 0 && analytics.blockedAging.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-lg">
          <BarChart3 className="w-8 h-8 text-slate-800 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-bold">
            No data yet. Charts will appear after snapshots are captured.
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            Snapshots run weekly via cron or can be triggered manually.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
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
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white">{value}</span>
        {unit && (
          <span className="text-[10px] font-bold text-slate-500">{unit}</span>
        )}
      </div>
    </div>
  );
}
