'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Code2, Terminal, Sparkles, RefreshCcw, Zap, Lock, BookOpen,
  FileText, Plus, Trash2, X, ChevronRight, Search, Settings2,
  ListTodo, FolderTree, Info, ClipboardList, PlayCircle, BadgeCheck,
  ChevronDown, ChevronUp, UserCheck, ChevronLeft, Filter, Boxes,
  Check, FileUp, FileCode, HardDrive, CreditCard, Bell, AlertCircle,
  Save, Cpu, Loader2
} from 'lucide-react';
import { Framework, Styling, Backend, PromptConfig, OptimizationResult, Source, TaskItem, SelectedBlueprint, NotificationProvider, PaymentProvider, ProjectSpec, StateManagement } from '../../lib/types';
import { CATEGORIES, BLUEPRINTS, Blueprint } from '../../lib/blueprints';
import { useProjects, useProject, useCreateProject, useUpdateProject, useProjectSpecs, useSaveSpec, useCreatePlaceholderSpec, useUpdateSpec, useSources, useAddSource, useDeleteSource } from '../../lib/hooks/useProjects';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { architectureSchema } from '../../lib/ai-schemas';
import { createClient } from '../../lib/supabase/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import JSZip from 'jszip';
import ReactMarkdown from 'react-markdown';
import { ExecutionBoard } from './ExecutionBoard';
import { FocusView } from './FocusView';
import { DependencyGraph } from './DependencyGraph';
import { WeeklyReview } from './WeeklyReview';
import { AnalyticsBoard } from './AnalyticsBoard';
import { NextTaskRecommendation } from './NextTaskRecommendation';
import { DailyStandup } from './DailyStandup';
import { StreamingStageView } from './StreamingStageView';
import { toast } from 'sonner';

const FRAMEWORKS: Framework[] = ['Next.js', 'React', 'Vue 3', 'SvelteKit', 'Astro'];
// ... (rest of constants stay same)
const STYLING: Styling[] = ['Shadcn/UI', 'Tailwind CSS', 'Chakra UI', 'Styled Components', 'CSS Modules'];
const BACKENDS: Backend[] = ['Supabase', 'Appwrite', 'Pocketbase', 'PostgreSQL', 'N8N (Workflows)'];
const NOTIFICATIONS: NotificationProvider[] = ['Novu (In-App/Infra)', 'OneSignal (Push)', 'Twilio (SMS)', 'Resend (Email)'];
const PAYMENTS: PaymentProvider[] = ['PayStack', 'Stripe', 'LemonSqueezy', 'Paddle', 'PayPal'];
const STATE_MANAGEMENT: StateManagement[] = ['React Query', 'Redux Toolkit', 'Zustand', 'Context API', 'None'];

const ITEMS_PER_PAGE = 4;

const TaskCard: React.FC<{ task: TaskItem }> = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);
  const priorityColor = {
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
  } as const;

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
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ListTodo className="w-3 h-3" /> Subtasks</h6>
              <div className="space-y-2">
                {task.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-start gap-3 p-3 bg-slate-950/50 border border-slate-800/50 rounded-md">
                    <div className="w-4 h-4 rounded border border-slate-700 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-200 uppercase tracking-tight">{sub.title}</div>
                      <div className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{sub.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const DashboardView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: project } = useProject(selectedProjectId);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const saveSpec = useSaveSpec();
  const createPlaceholder = useCreatePlaceholderSpec();
  const updateSpec = useUpdateSpec();
  const { data: specs } = useProjectSpecs(selectedProjectId);
  const { data: sourcesData, isLoading: sourcesLoading, isError: sourcesError } = useSources(selectedProjectId);
  const addSource = useAddSource();
  const router = useRouter();
  const supabase = createClient();

  const {
    object: streamResult,
    isLoading: isStreaming,
    submit: streamSpec,
  } = useObject({
    api: `/api/projects/${selectedProjectId || 'placeholder'}/generate-spec`,
    schema: architectureSchema,
    onFinish: async ({ object }: { object: OptimizationResult | undefined; error: Error | undefined }) => {
      if (object && selectedProjectId && placeholderSpecId) {
        try {
          await updateSpec.mutateAsync({ specId: placeholderSpecId, projectId: selectedProjectId, result: object as OptimizationResult });
          toast.success('Spec generated successfully');
        } catch (err: any) {
          toast.error(err.message || 'Failed to save spec');
        }
      }
      setStreamingDone(true);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to generate spec');
      setStreamingDone(true);
    },
  });

  const [streamingDone, setStreamingDone] = useState(false);
  const [placeholderSpecId, setPlaceholderSpecId] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rawPrompt, setRawPrompt] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeBlueprints, setActiveBlueprints] = useState<SelectedBlueprint[]>([]);
  const [selectedBlueprintForModal, setSelectedBlueprintForModal] = useState<Blueprint | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isStackModalOpen, setIsStackModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastedName, setPastedName] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(['quick-start']));
  const [exportSelection, setExportSelection] = useState({
    implementationPlan: true,
    architectureNotes: true,
    directoryStructure: true,
    fullSpec: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [config, setConfig] = useState<Omit<PromptConfig, 'sources'>>({
    framework: 'Next.js',
    styling: 'Shadcn/UI',
    backend: 'Supabase',
    tooling: ['TypeScript', 'Zod', 'React Hook Form'],
    providers: ['Resend (Email)'],
    payments: ['PayStack'],
    stateManagement: 'React Query',
    customContext: ''
  });

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Sync selectedProjectId with query params
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [searchParams]);

  // Update URL when selectedProjectId changes
  const updateProjectQuery = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('project', id);
    } else {
      params.delete('project');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Auto-select latest project if none is selected
  useEffect(() => {
    if (!searchParams.get('project') && projectsData && projectsData.length > 0) {
      updateProjectQuery(projectsData[0].id);
    }
  }, [projectsData, searchParams]);

  // Sync state with fetched project
  useEffect(() => {
    if (project) {
      // console.log(project)
      setRawPrompt(project.rawPrompt || '');
      setProjectNameInput(project.name || '');
      if (project.blueprintConfig && project.blueprintConfig?.selectedBlueprints) {
        setActiveBlueprints(project.blueprintConfig.selectedBlueprints);
      }
      setConfig({
        framework: project.framework as Framework || 'Next.js',
        styling: project.styling as Styling || 'Shadcn/UI',
        backend: project.backend as Backend || 'Supabase',
        tooling: (project as any).tooling || ['TypeScript', 'Zod', 'React Hook Form'],
        providers: (project.notifications as NotificationProvider[]) || ['Resend (Email)'],
        payments: project.payments ? [project.payments as PaymentProvider] : ['Stripe'],
        stateManagement: project.stateManagement as StateManagement || 'React Query',
        customContext: project.description || ''
      });
    }
  }, [project]);

  useEffect(() => {
    if (specs && specs.length > 0) {
      const selectedSpec = activeVersionId
        ? specs.find((s: ProjectSpec) => s.id === activeVersionId)
        : specs[0];

      const targetSpec = selectedSpec || specs[0] as ProjectSpec;

      if (!activeVersionId && specs[0]) {
        setActiveVersionId(specs[0].id);
      }

      setResult({
        coldStartGuide: targetSpec.coldStartGuide,
        implementationPlan: targetSpec.tasks || [],
        architectureNotes: targetSpec.architectureNotes || "",
        directoryStructure: targetSpec.directoryStructure || "",
        fullMarkdownSpec: targetSpec.fullMarkdownSpec || targetSpec.coldStartGuide
      });
      setStreamingDone(false);
    } else if (!isStreaming && !streamingDone) {
      setResult(null);
      setActiveVersionId(null);
    }
  }, [specs, activeVersionId, isStreaming, streamingDone]);

  const handleExport = async () => {
    if (!result || !project) return;
    const zip = new JSZip();
    const folderName = `${project.name.replace(/\s+/g, '-').toLowerCase()}-v${specs?.find((s: any) => s.id === activeVersionId)?.version || 'latest'}`;
    const folder = zip.folder(folderName);

    if (folder) {
      if (exportSelection.implementationPlan) folder.file("implementation-plan.md", JSON.stringify(result.implementationPlan, null, 2));
      if (exportSelection.architectureNotes) folder.file("architecture-notes.md", result.architectureNotes);
      if (exportSelection.directoryStructure) folder.file("directory-structure.md", result.directoryStructure);
      if (exportSelection.fullSpec) folder.file("full-spec.md", result.fullMarkdownSpec);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!selectedProjectId || !project) return;

    const timer = setTimeout(() => {
      updateProject.mutate({
        id: selectedProjectId,
        data: {
          rawPrompt,
          blueprintConfig: { selectedBlueprints: activeBlueprints },
          framework: config.framework,
          styling: config.styling,
          backend: config.backend,
          notifications: config.providers,
          payments: config.payments[0],
          description: config.customContext
        }
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [rawPrompt, activeBlueprints, config, selectedProjectId, project]);

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

  const TEXT_FILE_TYPES = [
    'text/', 'application/json', 'application/javascript',
    'application/typescript', 'application/xml', 'application/yaml',
  ];

  const isTextFile = (file: File) => {
    if (TEXT_FILE_TYPES.some(t => file.type.startsWith(t))) return true;
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ['md', 'txt', 'ts', 'tsx', 'js', 'jsx', 'json', 'css', 'html', 'yaml', 'yml', 'sql', 'py', 'rb', 'go', 'rs', 'java', 'sh', 'env', 'gitignore', 'toml', 'csv', 'xml'].includes(ext || '');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    let projectId = selectedProjectId;
    if (!projectId) {
      try {
        const newProject = await createProject.mutateAsync("New Project");
        projectId = newProject.id;
        setSelectedProjectId(projectId);
      } catch (err: any) {
        toast.error(err.message || 'Failed to create project');
        return;
      }
    }

    Array.from(files).forEach((file: File) => {
      if (!isTextFile(file)) {
        toast.error(`${file.name}: Unsupported file type. Only text files are supported (md, txt, ts, js, json, etc.)`);
        return;
      }

      if (file.size > 500 * 1024) {
        toast.error(`${file.name}: File too large. Maximum size is 500KB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        addSource.mutate({
          projectId: projectId!,
          source: {
            name: file.name,
            content: ev.target?.result as string,
            type: file.type || file.name.split('.').pop() || 'text/plain'
          }
        }, {
          onError: (err: any) => {
            toast.error(err.message || `Failed to upload ${file.name}`);
          },
          onSuccess: () => {
            toast.success(`${file.name} uploaded successfully`);
          }
        });
      };
      reader.readAsText(file);
    });
  };

  const handlePasteSubmit = async () => {
    if (!pastedName.trim() || !pastedContent.trim()) return;

    let projectId = selectedProjectId;
    if (!projectId) {
      try {
        const newProject = await createProject.mutateAsync("New Project");
        projectId = newProject.id;
        updateProjectQuery(projectId);
      } catch (err: any) {
        toast.error(err.message || 'Failed to create project');
        return;
      }
    }

    addSource.mutate({
      projectId: projectId!,
      source: {
        name: pastedName.trim(),
        content: pastedContent.trim(),
        type: 'pasted'
      }
    }, {
      onSuccess: () => {
        setPastedName('');
        setPastedContent('');
        setIsPasteModalOpen(false);
        toast.success('Context added successfully');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to add context');
      }
    });
  };

  const deleteSource = useDeleteSource();

  const removeSource = (sourceId: string) => {
    if (!selectedProjectId) return;
    deleteSource.mutate(
      { projectId: selectedProjectId, sourceId },
      {
        onError: (err: any) => {
          toast.error(err.message || 'Failed to delete file');
        },
        onSuccess: () => {
          toast.success('File removed');
        }
      }
    );
  };

  const handleUpdateProjectName = () => {
    if (!selectedProjectId || !projectNameInput.trim()) {
      setIsEditingName(false);
      return;
    }
    updateProject.mutate({
      id: selectedProjectId,
      data: { name: projectNameInput.trim() }
    });
    setIsEditingName(false);
  };

  const handleProjectSelect = (id: string) => {
    updateProjectQuery(id);
    setIsSidebarOpen(false);
  };

  const handleOptimize = async () => {
    if (!selectedProjectId) {
      createProject.mutate("New Project", {
        onSuccess: (newProject) => {
          updateProjectQuery(newProject.id);
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to create project');
        }
      });
      return;
    }

    setStreamingDone(false);
    setResult(null);

    // Create placeholder spec to get version number immediately
    try {
      const placeholder = await createPlaceholder.mutateAsync(selectedProjectId);
      setPlaceholderSpecId(placeholder.id);
      setActiveVersionId(placeholder.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create spec placeholder');
      return;
    }

    const mappedSources = (sourcesData || []).map(s => ({
      name: s.name,
      content: s.content,
      type: s.type,
    }));

    streamSpec({
      config: {
        framework: config.framework,
        styling: config.styling,
        backend: config.backend,
        tooling: config.tooling,
        providers: config.providers,
        payments: config.payments,
        stateManagement: config.stateManagement,
        sources: mappedSources,
        selectedBlueprints: activeBlueprints,
        customContext: rawPrompt || '',
        rawPrompt: rawPrompt || '',
      },
    });
  };

  const removeActiveBlueprint = (blueprintId: string) => {
    setActiveBlueprints(prev => prev.filter(b => b.blueprintId !== blueprintId));
  };

  const toggleStackItem = (key: 'providers' | 'payments', val: any) => {
    setConfig(prev => {
      const current = (prev[key] || []) as any[];
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

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isStreamingView = isStreaming || streamingDone;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-white/20">
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-slate-900 rounded-md transition-colors text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-white p-1 rounded-md">
              <Code2 className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white uppercase hidden sm:block">Architect</span>
          </button>
          <div className="h-4 w-px bg-slate-800 mx-2 hidden md:block" />

          {selectedProjectId ? (
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <input
                  autoFocus
                  value={projectNameInput}
                  onChange={(e) => setProjectNameInput(e.target.value)}
                  onBlur={handleUpdateProjectName}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateProjectName()}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-white transition-all w-48"
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group"
                >
                  {project?.name || 'Untitled Project'}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3 rotate-45" />
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">System Configurator</div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Status: Connected</div>
          <div className="h-4 w-px bg-slate-800 mx-2 hidden lg:block" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 hover:border-slate-700 transition-all group"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors hidden sm:block">Sign Out</span>
          </button>
          <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center"><UserIcon className="w-4 h-4 text-white" /></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Project Vault Sidebar */}
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:relative z-[60] md:z-auto
          w-64 h-full border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
        `}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><HardDrive className="w-3 h-3" /> Project Vault</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  createProject.mutate("New Project", {
                    onSuccess: (newProject) => updateProjectQuery(newProject.id)
                  });
                }}
                className="p-1 hover:bg-slate-900 rounded-md text-slate-500 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 hover:bg-slate-900 rounded-md text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
            {projectsLoading ? (
              <div className="p-4 flex justify-center"><RefreshCcw className="w-4 h-4 animate-spin text-slate-700" /></div>
            ) : projectsData?.map((p: any) => (
              <button
                key={p.id}
                onClick={() => handleProjectSelect(p.id)}
                className={`w-full text-left p-3 rounded-md text-[11px] font-bold uppercase transition-all group border ${selectedProjectId === p.id ? 'bg-white border-white text-slate-950' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate">{p.name || "Untitled"}</span>
                  <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${selectedProjectId === p.id ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:opacity-100'}`} />
                </span>
                <span className={`block text-[8px] mt-1 font-black ${selectedProjectId === p.id ? 'text-slate-500' : 'text-slate-700'}`}>
                  {mounted ? new Date(p.createdAt).toLocaleDateString() : '...'}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full space-y-8">
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
                            <span className={`block p-2 rounded-md transition-colors w-fit ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 group-hover:bg-slate-700'}`}>{bp.icon}</span>
                            <span className="block min-w-0">
                              <span className={`text-xs font-bold block truncate ${isActive ? 'text-slate-950' : 'text-slate-100'}`}>{bp.name}</span>
                              <span className={`text-[8px] uppercase font-black tracking-widest ${isActive ? 'text-slate-500' : 'text-slate-500'}`}>{bp.badge}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>


                    {totalPages > 1 && (
                      <div className="mt-6 py-4 border-t border-slate-900 flex items-center justify-between">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-[10px] font-black text-slate-600 uppercase">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>

                  {activeBlueprints.length && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300 border-t border-slate-900 pt-3">

                      {activeBlueprints.length > 0 &&
                        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300 pt-3">
                          {activeBlueprints.map(ab => (
                            <div key={ab.blueprintId} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-[9px] font-black text-slate-200 group uppercase tracking-widest hover:border-slate-700 transition-colors">
                              {ab.name}
                              <button onClick={() => removeActiveBlueprint(ab.blueprintId)} className="text-slate-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      }
                    </div>
                  )}
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
                    {config.providers?.map(p => (
                      <div key={p} className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase">
                        <span className="text-slate-500 font-black mr-1">NOTIF:</span> {p}
                      </div>
                    ))}
                    {config.payments?.map(p => (
                      <div key={p} className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase">
                        <span className="text-slate-500 font-black mr-1">PAY:</span> {p}
                      </div>
                    ))}

                    {config.stateManagement && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase">
                        <span className="text-slate-500 font-black mr-1">STATE:</span> {config.stateManagement}
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm relative">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500"><HardDrive className="w-4 h-4" /> 3. Project Context</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsPasteModalOpen(true)}
                        className="flex items-center gap-2  px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-md text-[9px] font-black uppercase tracking-widest hover:border-slate-600 transition-all"
                      >
                        <ClipboardList className="w-3 h-3" />
                        Paste
                      </button>


                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={addSource.isPending}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 disabled:opacity-50 hover:border-slate-600 rounded-md text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        {addSource.isPending ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <FileUp className="w-3 h-3" />
                        )}
                        Upload
                      </button>
                    </div>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} accept=".md,.txt,.ts,.tsx,.js,.jsx,.json,.css,.html,.yaml,.yml,.sql,.py,.rb,.go,.rs,.java,.sh,.env,.toml,.csv,.xml" className="hidden" />
                  </div>

                  {sourcesLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Scanning Files...</p>
                    </div>
                  ) : sourcesError ? (
                    <div className="py-8 text-center bg-red-500/5 border border-red-500/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Failed to load context</p>
                      <p className="text-[9px] text-slate-500 mt-1">Check your connection and try again</p>
                    </div>
                  ) : !sourcesData || sourcesData.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-900 rounded-lg p-6 text-center">
                      <FileUp className="w-6 h-6 text-slate-800 mx-auto mb-3" />
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Upload schemas, PRDs, or code context</p>
                      <p className="text-[8px] text-slate-700 mt-1">.md .txt .ts .js .json .sql .py and more</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sourcesData.map(src => (
                        <div key={src.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-md group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 bg-slate-950 border border-slate-800 rounded text-slate-500">
                              {src.name?.endsWith?.('.tsx') || src.name?.endsWith?.('.ts') ? <FileCode className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-[10px] font-bold text-slate-200 truncate uppercase">{src.name}</span>
                          </div>
                          <button
                            onClick={() => removeSource(src.id)}
                            disabled={deleteSource.isPending}
                            className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                          >
                            {deleteSource.isPending && deleteSource.variables?.sourceId === src.id ? (
                              <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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
                    placeholder="Define user stories, business rules, or specific edge cases..."
                    className="w-full h-32 bg-slate-900 border border-slate-800 rounded-md p-4 text-xs leading-relaxed mb-6 focus:border-slate-500 transition-all outline-none resize-none placeholder:text-slate-700"
                  />


                  <button
                    onClick={handleOptimize}
                    disabled={isStreaming || (!selectedProjectId && !rawPrompt.trim() && (!sourcesData || sourcesData.length === 0))}
                    className="w-full py-4 bg-white hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-md flex items-center justify-center gap-3 transition-all shadow-xl"
                  >
                    {isStreaming ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Architecting...</> : <><Zap className="w-4 h-4" /> Generate Spec</>}
                  </button>
                </section>
              </div>

              <div className="xl:col-span-7 flex flex-col min-h-[500px]">
                {!result && !isStreamingView ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-900 rounded-xl bg-slate-950/40">
                    <PlayCircle className="w-16 h-16 text-slate-900 mb-6" />
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Architect Board</h3>
                    <p className="text-slate-600 max-w-sm mx-auto text-sm leading-relaxed">Select modules to build a production-ready implementation plan.</p>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                    {/* Header Bar */}
                    <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Spec Output</span>
                      </div>
                      {!isStreamingView && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setStreamingDone(false);
                              setResult(null);
                              handleOptimize();
                            }}
                            disabled={isStreaming}
                            className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <RefreshCcw className="w-3 h-3" /> Regenerate
                          </button>
                          <button onClick={() => setIsExportModalOpen(true)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-slate-700 transition-colors flex items-center gap-1.5">
                            <Save className="w-3 h-3" /> Export
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Version Selector Bar */}
                    {(() => {
                      const placeholderSpec = placeholderSpecId ? specs?.find((s: any) => s.id === placeholderSpecId) : null;
                      const showVersionBar = (specs && specs.length > 0) || placeholderSpec;

                      if (!showVersionBar) return null;

                      return (
                        <div className="px-6 py-2.5 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Version</span>
                            <div className="flex items-center gap-1.5">
                              {(specs || []).map((s: any) => (
                                <button
                                  key={s.id}
                                  onClick={() => !isStreaming && setActiveVersionId(s.id)}
                                  disabled={isStreaming}
                                  className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all ${
                                    activeVersionId === s.id
                                      ? 'bg-white text-slate-950'
                                      : 'bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 disabled:opacity-50'
                                  }`}
                                >
                                  v{s.version}
                                  {isStreaming && s.id === placeholderSpecId && (
                                    <Loader2 className="w-2.5 h-2.5 ml-1 inline animate-spin" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {specs && specs[0] && activeVersionId === specs[0].id && !isStreaming && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase">Latest</span>
                            )}
                            {isStreaming && placeholderSpecId && (
                              <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] font-black text-blue-400 uppercase animate-pulse">Generating</span>
                            )}
                            {(() => {
                              const activeSpec = specs?.find((s: any) => s.id === activeVersionId);
                              if (activeSpec?.createdAt && !isStreaming) {
                                return (
                                  <span className="text-[9px] text-slate-600 font-bold">
                                    {new Date(activeSpec.createdAt).toLocaleDateString()}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Content: Streaming or Accordion */}
                    {isStreamingView ? (
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <StreamingStageView streamResult={streamResult as Partial<OptimizationResult>} isLoading={isStreaming} />
                      </div>
                    ) : (
                      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">

                      {/* Accordion: Quick Start */}
                      <div className="border border-slate-800 rounded-lg overflow-hidden">
                        <button onClick={() => toggleAccordion('quick-start')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                          <span className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Quick Start</span>
                          </span>
                          {openAccordions.has('quick-start') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {openAccordions.has('quick-start') && (
                          <div className="p-5 border-t border-slate-800 animate-in slide-in-from-top-1 duration-200">
                            <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap prose prose-invert prose-xs max-w-none">
                              <ReactMarkdown>{result?.coldStartGuide || ''}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Accordion: Implementation Plan */}
                      <div className="border border-slate-800 rounded-lg overflow-hidden">
                        <button onClick={() => toggleAccordion('tasks')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                          <span className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Implementation Plan</span>
                            <span className="text-[9px] font-black text-slate-500 ml-1">{result?.implementationPlan?.length || 0} tasks</span>
                          </span>
                          {openAccordions.has('tasks') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {openAccordions.has('tasks') && (
                          <div className="p-5 border-t border-slate-800 space-y-3 animate-in slide-in-from-top-1 duration-200">
                            {result?.implementationPlan?.map((task) => (
                              <TaskCard key={task.id} task={task} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Accordion: Architecture */}
                      <div className="border border-slate-800 rounded-lg overflow-hidden">
                        <button onClick={() => toggleAccordion('architecture')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                          <span className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Architecture</span>
                          </span>
                          {openAccordions.has('architecture') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {openAccordions.has('architecture') && (
                          <div className="p-5 border-t border-slate-800 animate-in slide-in-from-top-1 duration-200">
                            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{result?.architectureNotes}</div>
                          </div>
                        )}
                      </div>

                      {/* Accordion: File Structure */}
                      <div className="border border-slate-800 rounded-lg overflow-hidden">
                        <button onClick={() => toggleAccordion('file-structure')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                          <span className="flex items-center gap-2">
                            <FolderTree className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">File Structure</span>
                          </span>
                          {openAccordions.has('file-structure') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {openAccordions.has('file-structure') && (
                          <div className="p-5 border-t border-slate-800 animate-in slide-in-from-top-1 duration-200">
                            <pre className="text-[10px] text-slate-200 overflow-x-auto font-mono">{result?.directoryStructure}</pre>
                          </div>
                        )}
                      </div>

                      {/* Accordion: Full Spec */}
                      <div className="border border-slate-800 rounded-lg overflow-hidden">
                        <button onClick={() => toggleAccordion('full-spec')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                          <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Full Spec</span>
                          </span>
                          {openAccordions.has('full-spec') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {openAccordions.has('full-spec') && (
                          <div className="p-5 border-t border-slate-800 animate-in slide-in-from-top-1 duration-200">
                            <div className="text-xs text-slate-300 leading-relaxed font-medium prose prose-invert prose-xs max-w-none">
                              <ReactMarkdown>{result?.fullMarkdownSpec || ''}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Accordion: Execution */}
                      {selectedProjectId && (
                        <div className="border border-slate-800 rounded-lg overflow-hidden">
                          <button onClick={() => toggleAccordion('execution')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                            <span className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-white" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Execution</span>
                            </span>
                            {openAccordions.has('execution') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          </button>
                          {openAccordions.has('execution') && (
                            <div className="p-5 border-t border-slate-800 space-y-4 animate-in slide-in-from-top-1 duration-200">
                              <NextTaskRecommendation projectId={selectedProjectId} />
                              <ExecutionBoard projectId={selectedProjectId} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Accordion: Focus */}
                      {selectedProjectId && (
                        <div className="border border-slate-800 rounded-lg overflow-hidden">
                          <button onClick={() => toggleAccordion('focus')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                            <span className="flex items-center gap-2">
                              <BadgeCheck className="w-4 h-4 text-white" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Focus</span>
                            </span>
                            {openAccordions.has('focus') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          </button>
                          {openAccordions.has('focus') && (
                            <div className="p-5 border-t border-slate-800 space-y-4 animate-in slide-in-from-top-1 duration-200">
                              <DailyStandup projectId={selectedProjectId} />
                              <FocusView projectId={selectedProjectId} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Accordion: Dependencies */}
                      {selectedProjectId && (
                        <div className="border border-slate-800 rounded-lg overflow-hidden">
                          <button onClick={() => toggleAccordion('dependencies')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                            <span className="flex items-center gap-2">
                              <Boxes className="w-4 h-4 text-white" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Dependencies</span>
                            </span>
                            {openAccordions.has('dependencies') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          </button>
                          {openAccordions.has('dependencies') && (
                            <div className="border-t border-slate-800 animate-in slide-in-from-top-1 duration-200">
                              <DependencyGraph projectId={selectedProjectId} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Accordion: Review */}
                      {selectedProjectId && (
                        <div className="border border-slate-800 rounded-lg overflow-hidden">
                          <button onClick={() => toggleAccordion('review')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                            <span className="flex items-center gap-2">
                              <ClipboardList className="w-4 h-4 text-white" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Weekly Review</span>
                            </span>
                            {openAccordions.has('review') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          </button>
                          {openAccordions.has('review') && (
                            <div className="border-t border-slate-800 animate-in slide-in-from-top-1 duration-200">
                              <WeeklyReview projectId={selectedProjectId} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Accordion: Analytics */}
                      {selectedProjectId && (
                        <div className="border border-slate-800 rounded-lg overflow-hidden">
                          <button onClick={() => toggleAccordion('analytics')} className="w-full px-5 py-3 bg-slate-900 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-white" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Analytics</span>
                            </span>
                            {openAccordions.has('analytics') ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          </button>
                          {openAccordions.has('analytics') && (
                            <div className="border-t border-slate-800 animate-in slide-in-from-top-1 duration-200">
                              <AnalyticsBoard projectId={selectedProjectId} />
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        </main >

        {/* Modals */}
        {
          isStackModalOpen && (
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
                  { label: 'Payments', options: PAYMENTS, key: 'payments', type: 'multi' },
                  { label: 'State Management', options: STATE_MANAGEMENT, key: 'stateManagement', type: 'single' }
                ].map(group => (
                  <div key={group.label} className="space-y-4">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{group.label}</label>
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
                <div className="flex justify-end pt-4">
                  <button onClick={() => setIsStackModalOpen(false)} className="px-8 py-3 rounded-md bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-slate-200 transition-colors">Confirm</button>
                </div>
              </div>
            </div>
          )
        }

        {
          isFilterModalOpen && (
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
                <div className="pt-4 border-t border-slate-900">
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic text-center">Select a category to refine available modules</p>
                </div>
              </div>
            </div>
          )
        }

        {
          selectedBlueprintForModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">{selectedBlueprintForModal.icon}</div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedBlueprintForModal.name}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Select Sub-Modules</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedBlueprintForModal(null); setSelectedSubs([]); }} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-8 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
                  {selectedBlueprintForModal.subcategories.map(sub => (
                    <label key={sub.id} className={`flex items-start gap-6 p-5 rounded-lg border transition-all cursor-pointer group ${selectedSubs.includes(sub.id) ? 'bg-white border-white text-slate-950' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                      <input type="checkbox" className="hidden" checked={selectedSubs.includes(sub.id)} onChange={() => setSelectedSubs(prev => prev.includes(sub.id) ? prev.filter(x => x !== sub.id) : [...prev, sub.id])} />
                      <div className={`w-5 h-5 rounded border-2 shrink-0 ${selectedSubs.includes(sub.id) ? 'bg-slate-950 border-slate-950' : 'border-slate-700'} flex items-center justify-center`}>
                        {selectedSubs.includes(sub.id) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedSubs.includes(sub.id) ? 'text-slate-950' : 'text-slate-200'}`}>{sub.label}</div>
                        <div className={`text-[11px] font-medium leading-relaxed ${selectedSubs.includes(sub.id) ? 'text-slate-600' : 'text-slate-500'}`}>{sub.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="p-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => { setSelectedBlueprintForModal(null); setSelectedSubs([]); }} className="flex-1 py-3 px-6 rounded-md border border-slate-800 text-slate-500 font-bold text-[10px] uppercase transition-colors hover:bg-slate-900">Cancel</button>
                  <button onClick={() => {
                    const labels = selectedBlueprintForModal.subcategories.filter(s => selectedSubs.includes(s.id)).map(s => s.label);
                    const finalLabels = labels.length > 0 ? [...labels] : [];
                    setActiveBlueprints(prev => {
                      const filtered = prev.filter(p => p.blueprintId !== selectedBlueprintForModal.id);
                      return [...filtered, { blueprintId: selectedBlueprintForModal.id, name: selectedBlueprintForModal.name, prompt: selectedBlueprintForModal.prompt, selectedSubLabels: finalLabels }];
                    });
                    setSelectedBlueprintForModal(null);
                    setSelectedSubs([]);
                  }} className="flex-[2] py-3 px-6 rounded-md bg-white text-slate-950 font-black text-[10px] uppercase shadow-md transition-all active:scale-95 hover:bg-slate-200">
                    {selectedSubs.length > 0 ? `Add ${selectedSubs.length} Modules` : 'Add Core Context'}
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {
          isPasteModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-xl p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Paste Project Source</h3>
                  <button onClick={() => setIsPasteModalOpen(false)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-900 rounded-md transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Document Title</label>
                    <input
                      value={pastedName}
                      onChange={(e) => setPastedName(e.target.value)}
                      placeholder="e.g. system_architecture.md"
                      className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-3 text-xs outline-none text-white font-medium focus:border-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Content</label>
                    <textarea
                      value={pastedContent}
                      onChange={(e) => setPastedContent(e.target.value)}
                      placeholder="Paste documentation, requirements, or code here..."
                      className="w-full h-48 bg-slate-900 border border-slate-800 rounded-md p-4 text-xs text-white outline-none resize-none font-mono focus:border-slate-500 transition-all custom-scrollbar"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePasteSubmit}
                  disabled={addSource.isPending || !pastedName.trim() || !pastedContent.trim()}
                  className="w-full py-4 bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-md hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  {addSource.isPending ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {addSource.isPending ? 'Saving...' : 'Add Source'}
                </button>
              </div>
            </div>
          )
        }

        {
          isExportModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Save className="w-4 h-4" /> Export Spec</h3>
                  <button onClick={() => setIsExportModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-400 mb-4">Select the artifacts you want to include in the ZIP bundle.</p>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors group">
                      <input type="checkbox" checked={exportSelection.implementationPlan} onChange={(e) => setExportSelection(prev => ({ ...prev, implementationPlan: e.target.checked }))} className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Implementation Plan (JSON/MD)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors group">
                      <input type="checkbox" checked={exportSelection.architectureNotes} onChange={(e) => setExportSelection(prev => ({ ...prev, architectureNotes: e.target.checked }))} className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Architecture Notes</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors group">
                      <input type="checkbox" checked={exportSelection.directoryStructure} onChange={(e) => setExportSelection(prev => ({ ...prev, directoryStructure: e.target.checked }))} className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Directory Structure</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors group">
                      <input type="checkbox" checked={exportSelection.fullSpec} onChange={(e) => setExportSelection(prev => ({ ...prev, fullSpec: e.target.checked }))} className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Full Specification (MD)</span>
                    </label>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setIsExportModalOpen(false)} className="flex-1 py-3 px-6 rounded-md border border-slate-800 text-slate-500 font-bold text-[10px] uppercase transition-colors hover:bg-slate-900">Cancel</button>
                    <button onClick={handleExport} className="flex-1 py-3 px-6 rounded-md bg-white text-slate-950 font-black text-[10px] uppercase transition-colors hover:bg-slate-200 shadow-lg">Download ZIP</button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};
