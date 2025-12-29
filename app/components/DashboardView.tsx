'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  Code2, Terminal, Sparkles, RefreshCcw, Zap, Lock, BookOpen,
  FileText, Plus, Trash2, X, ChevronRight, Search, Settings2,
  ListTodo, FolderTree, Info, ClipboardList, PlayCircle, BadgeCheck,
  ChevronDown, ChevronUp, UserCheck, ChevronLeft, Filter, Boxes,
  Check, FileUp, FileCode, HardDrive, CreditCard, Bell, FileSignature,
  AlignLeft, Type, Download, Save, History, Box, ExternalLink
} from 'lucide-react';
import { Framework, Styling, Backend, PromptConfig, OptimizationResult, Source, TaskItem, SelectedBlueprint, NotificationProvider, PaymentProvider } from '../../lib/types';
import { CATEGORIES, BLUEPRINTS, Blueprint } from '../../lib/blueprints';
import { optimizePrompt } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';
import { exportProjectBundle } from '../../lib/zip';

const FRAMEWORKS: Framework[] = ['Next.js', 'React', 'Vue 3', 'SvelteKit', 'Astro'];
const STYLING: Styling[] = ['Shadcn/UI', 'Tailwind CSS', 'Chakra UI', 'Styled Components', 'CSS Modules'];
const BACKENDS: Backend[] = ['Supabase', 'Appwrite', 'Pocketbase', 'PostgreSQL', 'N8N (Workflows)'];
const NOTIFICATIONS: NotificationProvider[] = ['Novu (In-App/Infra)', 'OneSignal (Push)', 'Twilio (SMS)', 'Resend (Email)'];
const PAYMENTS: PaymentProvider[] = ['Stripe', 'LemonSqueezy', 'Paddle', 'PayPal'];

const ITEMS_PER_PAGE = 4;

const TaskCard: React.FC<{ task: TaskItem }> = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);
  const priorityColor = {
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
  };

  return (
    <div className={`p-4 md:p-5 bg-slate-900/40 border transition-all rounded-lg group ${isOpen ? 'border-slate-500 shadow-md' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className="flex items-start gap-3 md:gap-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-8 h-8 rounded-md bg-slate-950 border border-slate-800 text-[10px] flex items-center justify-center font-black text-slate-500 group-hover:text-white transition-colors shrink-0">{task.id}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
            <h5 className="font-bold text-slate-100 text-sm truncate">{task.title}</h5>
            <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${priorityColor[task.priority]}`}>{task.priority}</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
        </div>
        <button className="p-2 text-slate-500 group-hover:text-white transition-colors">{isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
      </div>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div>
            <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Info className="w-3 h-3" /> Implementation Details</h6>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-md border border-slate-800/50">{task.details}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><BadgeCheck className="w-3 h-3" /> QA Strategy</h6>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">{task.testStrategy}</p>
            </div>
            <div>
              <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FolderTree className="w-3 h-3" /> Affected Files</h6>
              <div className="flex flex-wrap gap-1.5">{task.files_involved.map(f => (<span key={f} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-mono text-slate-500">{f}</span>))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DashboardView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rawPrompt, setRawPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'architecture' | 'files'>('tasks');
  const [sources, setSources] = useState<Source[]>([]);
  const [activeBlueprints, setActiveBlueprints] = useState<SelectedBlueprint[]>([]);
  const [selectedBlueprintForModal, setSelectedBlueprintForModal] = useState<Blueprint | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isStackModalOpen, setIsStackModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastedName, setPastedName] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [projectName, setProjectName] = useState('New Project');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectHistory, setProjectHistory] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<Omit<PromptConfig, 'sources'>>({
    framework: 'Next.js',
    styling: 'Shadcn/UI',
    backend: 'Supabase',
    tooling: ['TypeScript', 'Zod', 'React Hook Form'],
    providers: ['Resend (Email)'],
    payments: ['Stripe'],
    customContext: ''
  });

  // Supabase: Fetch Project History
  const fetchHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (!error) setProjectHistory(data || []);
    } catch (e) { console.error("History fetch error", e); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filteredBlueprints = useMemo(() => {
    return BLUEPRINTS.filter(bp => {
      const matchesCategory = activeCategory === 'all' || bp.category === activeCategory;
      const matchesSearch = bp.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredBlueprints.length / ITEMS_PER_PAGE);
  const currentBlueprints = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlueprints.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlueprints, currentPage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSources(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: ev.target?.result as string,
          type: 'file'
        }]);
      };
      reader.readAsText(file);
    });
  };

  const handlePasteSubmit = useCallback(() => {
    if (!pastedName.trim() || !pastedContent.trim()) return;
    setSources(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name: pastedName.trim(),
      content: pastedContent.trim(),
      type: 'pasted'
    }]);
    setPastedName('');
    setPastedContent('');
    setIsPasteModalOpen(false);
  }, [pastedName, pastedContent]);

  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const persistProject = async (currentResult: OptimizationResult | null) => {
    setSaving(true);
    try {
      let projectId = currentProjectId;

      // 1. Ensure project exists
      if (!projectId) {
        const { data, error } = await supabase.from('projects').insert([{
          name: projectName,
          framework: config.framework
        }]).select();
        if (error) throw error;
        projectId = data[0].id;
        setCurrentProjectId(projectId);
      } else {
        await supabase.from('projects').update({ name: projectName, framework: config.framework }).eq('id', projectId);
      }

      // 2. Sync Sources (Simple replace for this prototype)
      await supabase.from('sources').delete().eq('project_id', projectId);
      if (sources.length > 0) {
        await supabase.from('sources').insert(sources.map(s => ({
          project_id: projectId,
          name: s.name,
          content: s.content,
          type: s.type
        })));
      }

      // 3. Save Artifact
      if (currentResult) {
        await supabase.from('artifacts').insert([{
          project_id: projectId,
          result: currentResult,
          prompt: rawPrompt
        }]);
      }

      await fetchHistory();
    } catch (err) {
      console.error("Persistence failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const data = await optimizePrompt(rawPrompt, { ...config, sources, selectedBlueprints: activeBlueprints });
      setResult(data);
      // Automatically persist on success
      await persistProject(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;
    try {
      await exportProjectBundle(projectName, result, sources);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const loadProject = async (proj: any) => {
    setCurrentProjectId(proj.id);
    setProjectName(proj.name);
    setConfig(prev => ({ ...prev, framework: proj.framework || prev.framework }));

    // Fetch sources
    const { data: srcData } = await supabase.from('sources').select('*').eq('project_id', proj.id);
    setSources(srcData || []);

    // Fetch latest artifact
    const { data: artData } = await supabase.from('artifacts').select('*').eq('project_id', proj.id).order('created_at', { ascending: false }).limit(1);
    if (artData?.[0]) {
      setResult(artData[0].result);
      setRawPrompt(artData[0].prompt || '');
    } else {
      setResult(null);
    }

    setIsHistoryOpen(false);
  };

  const removeActiveBlueprint = (blueprintId: string) => {
    setActiveBlueprints(prev => prev.filter(b => b.blueprintId !== blueprintId));
  };

  const toggleStackItem = (key: 'providers' | 'payments', val: any) => {
    setConfig(prev => {
      const current: any[] = prev[key] || [];
      const exists = current.includes(val);
      return {
        ...prev,
        [key]: exists ? current.filter(i => i !== val) : [...current, val]
      };
    });
  };

  const activeCategoryLabel = useMemo(() => {
    return CATEGORIES.find(c => c.id === activeCategory)?.label;
  }, [activeCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-white/20">
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-white p-1 rounded-md">
              <Code2 className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white uppercase">Architect</span>
          </button>
          <div className="h-4 w-px bg-slate-800 mx-2 hidden md:block" />
          <div className="flex items-center gap-2 group">
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none focus:text-white transition-colors w-32"
            />
            <button onClick={() => setIsHistoryOpen(true)} className="p-1 hover:bg-slate-900 rounded transition-colors">
              <History className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Status: Connected</div>
          <button onClick={() => persistProject(result)} disabled={saving} className="p-2 bg-slate-900 border border-slate-800 rounded-md hover:border-slate-600 transition-all flex items-center gap-2">
            <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest hidden md:block">{saving ? 'Saving...' : 'Save'}</span>
          </button>
          <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center"><UserCheck className="w-4 h-4 text-white" /></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-5 space-y-8">
            <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
              <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500">
                  <Terminal className="w-4 h-4" /> 1. Functional Modules
                </h2>

                <div className="flex items-center gap-2">
                  <button onClick={() => setIsFilterModalOpen(true)} className={`h-11 px-4 rounded-md border flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest ${activeCategory !== 'all' ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}>
                    <Filter className="w-3.5 h-3.5" /> Filter
                  </button>
                  <div className="flex-1 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-md px-4 h-11 focus-within:border-slate-500 transition-all">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search modules..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none placeholder:text-slate-600" />
                  </div>
                </div>

                {(activeCategory !== 'all' || activeBlueprints.length > 0) && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300 border-t border-slate-900 pt-3">
                    {activeCategory !== 'all' && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-md text-[9px] font-black text-indigo-400 group uppercase tracking-widest shadow-sm">
                        {activeCategoryLabel}
                        <button onClick={() => setActiveCategory('all')} className="text-indigo-400/60 hover:text-indigo-400 transition-colors ml-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {activeBlueprints.map(ab => (
                      <div key={ab.blueprintId} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-[9px] font-black text-slate-200 group uppercase tracking-widest hover:border-slate-700 transition-colors">
                        {ab.name}
                        <button onClick={() => removeActiveBlueprint(ab.blueprintId)} className="text-slate-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="min-h-[220px] flex flex-col justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  {currentBlueprints.map(bp => {
                    const isActive = activeBlueprints.some(ab => ab.blueprintId === bp.id);
                    return (
                      <button key={bp.id} onClick={() => {
                        setSelectedBlueprintForModal(bp);
                        setSelectedSubs(activeBlueprints.find(ab => ab.blueprintId === bp.id)?.selectedSubLabels.map(l => bp.subcategories.find(s => s.label === l)?.id || '').filter(id => id !== '') || []);
                      }} className={`p-4 rounded-lg border transition-all text-left group flex flex-col gap-3 ${isActive ? 'bg-white border-white' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'}`}>
                        <div className={`p-2 rounded-md transition-colors w-fit ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 group-hover:bg-slate-700'}`}>{bp.icon}</div>
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${isActive ? 'text-slate-950' : 'text-slate-100'}`}>{bp.name}</span>
                          <span className={`text-[8px] uppercase font-black tracking-widest ${isActive ? 'text-slate-500' : 'text-slate-500'}`}>{bp.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-[10px] font-black text-slate-600 uppercase">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500"><Settings2 className="w-4 h-4" /> 2. Tech Stack</h2>
                <button onClick={() => setIsStackModalOpen(true)} className="p-1.5 bg-slate-900 border border-slate-800 text-white rounded-md hover:bg-slate-800 transition-all"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase">
                  <span className="text-slate-500 font-black mr-1">FRAMEWORK:</span> {config.framework}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase">
                  <span className="text-slate-500 font-black mr-1">BACKEND:</span> {config.backend}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase">
                  <span className="text-slate-500 font-black mr-1">UI:</span> {config.styling}
                </div>
              </div>
            </section>

            <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500"><HardDrive className="w-4 h-4" /> 3. Project Context</h2>
                <div className="flex gap-2">
                  <button onClick={() => setIsPasteModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-md text-[9px] font-black uppercase tracking-widest transition-all">
                    <AlignLeft className="w-3.5 h-3.5" /> Paste Text
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-950 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                    <FileUp className="w-3.5 h-3.5" /> Upload File
                  </button>
                  <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {sources.length === 0 ? (
                <div className="border-2 border-dashed border-slate-900 rounded-lg p-8 text-center bg-slate-900/10">
                  <FileSignature className="w-8 h-8 text-slate-800 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Optional: Attach existing PRDs, schemas, or wireframes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sources.map(src => (
                    <div key={src.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-md group hover:bg-slate-900 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 bg-slate-950 border border-slate-800 rounded text-slate-500 group-hover:text-white transition-colors">
                          {src.type === 'pasted' ? <AlignLeft className="w-3.5 h-3.5" /> : (src.name.endsWith('.tsx') || src.name.endsWith('.ts') ? <FileCode className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 truncate uppercase tracking-tight">{src.name}</span>
                      </div>
                      <button onClick={() => removeSource(src.id)} className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm relative">
              <h2 className="text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-slate-500"><Sparkles className="w-4 h-4" /> 4. Custom Logic</h2>
              <textarea
                value={rawPrompt}
                onChange={(e) => setRawPrompt(e.target.value)}
                placeholder="Define unique user stories, complex business rules, or specific edge cases..."
                className="w-full h-32 bg-slate-900 border border-slate-800 rounded-md p-4 text-xs leading-relaxed mb-6 focus:border-slate-500 transition-all outline-none resize-none placeholder:text-slate-700"
              />
              <button onClick={handleOptimize} disabled={loading || (activeBlueprints.length === 0 && !rawPrompt.trim() && sources.length === 0)} className="w-full py-4 bg-white hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-md flex items-center justify-center gap-3 transition-all shadow-xl">
                {loading ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Architecting...</> : <><Zap className="w-4 h-4" /> Generate System Spec</>}
              </button>
            </section>
          </div>

          <div className="xl:col-span-7 flex flex-col">
            {!result && !loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-900 rounded-xl bg-slate-950/40 min-h-[500px]">
                <PlayCircle className="w-16 h-16 text-slate-900 mb-6" />
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Architecture Board</h3>
                <p className="text-slate-600 max-w-sm mx-auto text-sm leading-relaxed mt-2">Select modules and define your tech stack to generate a full-fidelity technical specification.</p>
              </div>
            ) : loading ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] bg-slate-950/20 rounded-xl border border-white/5 animate-pulse">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-8">
                  <RefreshCcw className="w-8 h-8 text-slate-950 animate-spin" />
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Building Infrastructure Blueprint...</div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[700px]">
                <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {['tasks', 'architecture', 'files'].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-white'}`}>{tab}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleExport} className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" /> Export .ZIP
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(result?.fullMarkdownSpec || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">
                      {copied ? 'Copied' : 'Copy MD'}
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  {activeTab === 'tasks' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-5">
                        <div className="p-3 bg-white rounded-md text-slate-950 shrink-0"><PlayCircle className="w-5 h-5" /></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Architectural Kickoff</h4>
                          <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{result?.coldStartGuide}</div>
                        </div>
                      </div>
                      <div className="space-y-4">{result?.implementationPlan.map((task) => (<TaskCard key={task.id} task={task} />))}</div>
                    </div>
                  )}
                  {activeTab === 'architecture' && <div className="p-8 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium animate-in fade-in">{result?.architectureNotes}</div>}
                  {activeTab === 'files' && <pre className="p-8 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-200 overflow-x-auto mono animate-in fade-in">{result?.directoryStructure}</pre>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* History Sidebar/Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full p-8 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Project Vault</h3>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {projectHistory.length === 0 ? (
                <div className="text-center py-20">
                  <Box className="w-12 h-12 text-slate-900 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No saved projects found</p>
                </div>
              ) : (
                projectHistory.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => loadProject(proj)}
                    className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-600 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white uppercase tracking-tight truncate">{proj.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{proj.framework}</div>
                      <div className="text-[8px] font-bold text-slate-700 uppercase tracking-widest italic">{new Date(proj.created_at).toLocaleDateString()}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other Modals (Stack, Filter, Paste, Blueprints) remain identical to previous functional versions... */}
      {/* (Adding JS-safe conditional rendering for brevity in this XML update) */}

      {isStackModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative bg-slate-950 border border-slate-800 rounded-lg w-full max-w-xl p-8 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Architect Stack Config</h3>
              <button onClick={() => setIsStackModalOpen(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {[
              { label: 'Framework', options: FRAMEWORKS, key: 'framework', type: 'single' },
              { label: 'Infrastructure', options: BACKENDS, key: 'backend', type: 'single' },
              { label: 'Styling', options: STYLING, key: 'styling', type: 'single' },
              { label: 'Notifications', options: NOTIFICATIONS, key: 'providers', type: 'multi' },
              { label: 'Payments', options: PAYMENTS, key: 'payments', type: 'multi' }
            ].map(group => (
              <div key={group.label}>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">{group.label}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {group.options.map(opt => {
                    const isSelected = group.type === 'single'
                      ? config[group.key as keyof typeof config] === opt
                      : (config[group.key as keyof typeof config] as any[]).includes(opt);

                    return (
                      <button
                        key={opt as string}
                        onClick={() => {
                          if (group.type === 'single') {
                            setConfig({ ...config, [group.key]: opt });
                          } else {
                            toggleStackItem(group.key as any, opt);
                          }
                        }}
                        className={`px-3 py-2.5 rounded-md border text-[10px] font-bold transition-all ${isSelected ? 'bg-white border-white text-slate-950 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {opt as string}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4"><button onClick={() => setIsStackModalOpen(false)} className="px-8 py-3 rounded-md bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-md">Confirm</button></div>
          </div>
        </div>
      )}

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-lg p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Architectural Categories</h3>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-900 rounded-md transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setIsFilterModalOpen(false); }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-[10px] font-black uppercase border transition-all ${activeCategory === cat.id ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                >
                  <span className={`${activeCategory === cat.id ? 'text-white' : 'text-slate-500'}`}>{cat.icon}</span>
                  {cat.label}
                  {activeCategory === cat.id && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isPasteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-xl p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlignLeft className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Paste Source Content</h3>
              </div>
              <button onClick={() => setIsPasteModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Document Name</label>
                <input
                  type="text"
                  value={pastedName}
                  onChange={(e) => setPastedName(e.target.value)}
                  placeholder="e.g., Product Requirements..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-3 text-xs outline-none focus:border-slate-500 transition-all text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Content</label>
                <textarea
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Paste content here..."
                  className="w-full h-48 bg-slate-900 border border-slate-800 rounded-md px-4 py-3 text-xs outline-none focus:border-slate-500 transition-all text-white resize-none font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setIsPasteModalOpen(false)} className="px-6 py-2.5 rounded-md border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
              <button onClick={handlePasteSubmit} disabled={!pastedName.trim() || !pastedContent.trim()} className="px-8 py-2.5 rounded-md bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-200">Add to Context</button>
            </div>
          </div>
        </div>
      )}

      {selectedBlueprintForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-8 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">{selectedBlueprintForModal.icon}</div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedBlueprintForModal.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Select sub-capabilities to include</p>
                </div>
              </div>
              <button onClick={() => { setSelectedBlueprintForModal(null); setSelectedSubs([]); }} className="text-slate-500 hover:text-white p-2 hover:bg-slate-900 rounded-md transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {selectedBlueprintForModal.subcategories.map(sub => (
                <label key={sub.id} className={`flex items-start gap-6 p-5 rounded-lg border transition-all cursor-pointer group ${selectedSubs.includes(sub.id) ? 'bg-white border-white text-slate-950' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                  <input type="checkbox" className="hidden" checked={selectedSubs.includes(sub.id)} onChange={() => setSelectedSubs(prev => prev.includes(sub.id) ? prev.filter(x => x !== sub.id) : [...prev, sub.id])} />
                  <div className={`w-5 h-5 rounded border-2 shrink-0 ${selectedSubs.includes(sub.id) ? 'bg-slate-950 border-slate-950 shadow-inner' : 'border-slate-700'} flex items-center justify-center transition-all`}>
                    {selectedSubs.includes(sub.id) && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedSubs.includes(sub.id) ? 'text-slate-950' : 'text-slate-200 group-hover:text-white'}`}>{sub.label}</div>
                    <div className={`text-[11px] font-medium leading-relaxed ${selectedSubs.includes(sub.id) ? 'text-slate-700/80' : 'text-slate-500'}`}>{sub.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-8 border-t border-slate-800 bg-slate-900/10 flex flex-col sm:flex-row gap-4">
              <button onClick={() => { setSelectedBlueprintForModal(null); setSelectedSubs([]); }} className="flex-1 py-3 px-6 rounded-md border border-slate-800 text-slate-500 font-bold text-[10px] uppercase hover:text-white transition-colors">Dismiss</button>
              <button onClick={() => {
                const labels = selectedBlueprintForModal.subcategories.filter(s => selectedSubs.includes(s.id)).map(s => s.label);
                const finalLabels = labels.length > 0 ? labels : ['Core Feature Focus'];
                setActiveBlueprints(prev => {
                  const filtered = prev.filter(p => p.blueprintId !== selectedBlueprintForModal.id);
                  return [...filtered, { blueprintId: selectedBlueprintForModal.id, name: selectedBlueprintForModal.name, selectedSubLabels: finalLabels }];
                });
                setSelectedBlueprintForModal(null);
                setSelectedSubs([]);
              }} className="flex-[2] py-3 px-6 rounded-md bg-white text-slate-950 font-black text-[10px] uppercase shadow-xl transition-all active:scale-95 hover:bg-slate-200">
                Apply Modules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardView;