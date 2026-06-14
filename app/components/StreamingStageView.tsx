'use client';

import React, { useEffect, useRef } from 'react';
import {
  BookOpen, FolderTree, ListTodo, Cpu, FileText,
  Check, Loader2, Circle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { OptimizationResult, TaskItem } from '../../lib/types';

interface Stage {
  key: string;
  label: string;
  icon: React.ReactNode;
  done: boolean;
  active: boolean;
}

function getStages(sr: Partial<OptimizationResult> | undefined): Stage[] {
  const stages: Stage[] = [
    { key: 'coldStartGuide', label: 'Quick Start', icon: <BookOpen className="w-3.5 h-3.5" />, done: !!(sr?.coldStartGuide && sr.coldStartGuide.length > 20), active: false },
    { key: 'directoryStructure', label: 'File Structure', icon: <FolderTree className="w-3.5 h-3.5" />, done: !!(sr?.directoryStructure && sr.directoryStructure.length > 10), active: false },
    { key: 'implementationPlan', label: 'Task Plan', icon: <ListTodo className="w-3.5 h-3.5" />, done: ((sr?.implementationPlan as any[])?.length ?? 0) > 0, active: false },
    { key: 'architectureNotes', label: 'Architecture', icon: <Cpu className="w-3.5 h-3.5" />, done: !!(sr?.architectureNotes && sr.architectureNotes.length > 20), active: false },
    { key: 'fullMarkdownSpec', label: 'Full Spec', icon: <FileText className="w-3.5 h-3.5" />, done: !!(sr?.fullMarkdownSpec && sr.fullMarkdownSpec.length > 50), active: false },
  ];

  const firstPending = stages.findIndex(s => !s.done);
  if (firstPending >= 0) {
    stages[firstPending].active = true;
  }

  return stages;
}

const TaskMiniCard: React.FC<{ task: any }> = ({ task }) => {
  const priorityColor = {
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  } as const;

  const pri: keyof typeof priorityColor = task.priority && task.priority in priorityColor ? task.priority : 'medium';

  return (
    <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[9px] font-black text-slate-500">{task.id || '...'}</span>
        <span className="text-xs font-bold text-slate-100 truncate">{task.title || '...'}</span>
        {task.priority && (
          <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${priorityColor[pri]}`}>{pri}</span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 line-clamp-2">{task.description || '...'}</p>
    </div>
  );
};

interface StreamingStageViewProps {
  streamResult: Partial<OptimizationResult> | undefined;
  isLoading: boolean;
}

export function StreamingStageView({ streamResult, isLoading }: StreamingStageViewProps) {
  const stages = getStages(streamResult);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastSectionRef = useRef<string>('');

  const validTasks = ((streamResult?.implementationPlan as any[]) || []).filter(
    (t: any) => t?.id && t?.title
  );

  useEffect(() => {
    const lastDone = [...stages].reverse().find(s => s.done);
    if (lastDone && lastDone.key !== lastSectionRef.current) {
      lastSectionRef.current = lastDone.key;
      setTimeout(() => {
        const el = document.getElementById(`stage-${lastDone.key}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [stages]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
      {/* Stage Progress Bar */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {stages.map((stage, i) => (
            <React.Fragment key={stage.key}>
              <div className="flex items-center gap-2">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500
                  ${stage.done
                    ? 'bg-emerald-500/20 border border-emerald-500/40'
                    : stage.active
                      ? 'bg-blue-500/20 border border-blue-500/40 animate-pulse'
                      : 'bg-slate-800 border border-slate-700'
                  }
                `}>
                  {stage.done ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : stage.active ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  ) : (
                    <Circle className="w-3 h-3 text-slate-600" />
                  )}
                </div>
                <span className={`
                  text-[9px] font-black uppercase tracking-widest hidden sm:block
                  ${stage.done ? 'text-emerald-400' : stage.active ? 'text-blue-400' : 'text-slate-600'}
                `}>
                  {stage.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-colors duration-500 ${
                  stages[i + 1].done || stages[i + 1].active ? 'bg-emerald-500/30' : 'bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Progressive Content */}
      <div ref={contentRef} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
        {/* Cold Start Guide */}
        {streamResult?.coldStartGuide && streamResult.coldStartGuide.length > 10 && (
          <div id="stage-coldStartGuide" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Quick Start</h4>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed prose prose-invert prose-xs max-w-none">
              <ReactMarkdown>{streamResult.coldStartGuide}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Directory Structure */}
        {streamResult?.directoryStructure && streamResult.directoryStructure.length > 5 && (
          <div id="stage-directoryStructure" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">File Structure</h4>
            </div>
            <pre className="p-5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 overflow-x-auto font-mono leading-relaxed">
              {streamResult.directoryStructure}
            </pre>
          </div>
        )}

        {/* Implementation Plan */}
        {validTasks.length > 0 && (
          <div id="stage-implementationPlan" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Task Plan
                <span className="text-slate-600 ml-2">{validTasks.length} tasks</span>
              </h4>
            </div>
            <div className="space-y-2">
              {validTasks.map((task: any, i: number) => (
                <TaskMiniCard key={task.id || i} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Architecture Notes */}
        {streamResult?.architectureNotes && streamResult.architectureNotes.length > 10 && (
          <div id="stage-architectureNotes" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Architecture</h4>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
              {streamResult.architectureNotes}
            </div>
          </div>
        )}

        {/* Full Spec */}
        {streamResult?.fullMarkdownSpec && streamResult.fullMarkdownSpec.length > 50 && (
          <div id="stage-fullMarkdownSpec" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Full Spec</h4>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed prose prose-invert prose-xs max-w-none">
              <ReactMarkdown>{streamResult.fullMarkdownSpec}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Active stage skeleton */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {stages.find(s => s.active)?.label || 'Generating'}...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}