
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Code2, Terminal, Sparkles, Database, Palette, Copy, Check, RefreshCcw,
  Zap, Github, ShieldCheck, Lock, LayoutDashboard, ShoppingBag, BookOpen,
  FileText, Plus, Trash2, BrainCircuit, MessageSquare, Smartphone, Mail, X,
  ChevronRight, Target, BarChart3, Bot, Users, Wallet, Truck, Key, Globe, Cpu,
  Search, Menu, Activity, Heart, Store, GanttChart, HardDrive, Bell, Settings2,
  ListTodo, FolderTree, Info, ClipboardList, PlayCircle, ShieldAlert, BadgeCheck,
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Share2, MousePointer2, 
  Table2, Layout, FormInput, BellRing, UserCheck, HardDriveDownload, ChevronLeft,
  Filter, CreditCard, Layers, Briefcase, Boxes, Rocket, Shield, Megaphone, Monitor
} from 'lucide-react';
import { Framework, Styling, Backend, Tooling, PromptConfig, OptimizationResult, Source, NotificationProvider, TaskItem, SelectedBlueprint } from './types';
import { optimizePrompt } from './services/geminiService';

interface Blueprint {
  id: string;
  category: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
  badge: string;
  subcategories: { id: string; label: string; description: string }[];
}

const LayersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.27a2 2 0 0 0 0 3.46l8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09a2 2 0 0 0 0-3.46z"/><path d="m2.6 14.27 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"/><path d="m2.6 10.27 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"/></svg>
);

const CATEGORIES = [
  { id: 'all', label: 'All Modules', icon: <LayersIcon className="w-4 h-4" /> },
  { id: 'saas', label: 'SaaS Core', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'ai', label: 'AI & Data', icon: <Bot className="w-4 h-4" /> },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'application', label: 'Dashboards', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'system', label: 'Infrastructure', icon: <Cpu className="w-4 h-4" /> },
];

const BLUEPRINTS: Blueprint[] = [
  {
    id: 'auth-multi-tenant',
    category: 'saas',
    name: 'RBAC & Multi-Tenancy',
    icon: <Lock className="w-4 h-4" />,
    badge: 'Security',
    prompt: "Advanced multi-tenant authentication with Row Level Security and Role-Based Access Control.",
    subcategories: [
      { id: 'rls', label: 'Supabase RLS', description: 'Policy-driven data isolation per organization.' },
      { id: 'roles', label: 'Dynamic Roles', description: 'Admin, Member, and Viewer permission levels.' },
      { id: 'invites', label: 'Invite Engine', description: 'Token-based email invitations for teams.' }
    ]
  },
  {
    id: 'saas-billing',
    category: 'saas',
    name: 'Subscription Engine',
    icon: <CreditCard className="w-4 h-4" />,
    badge: 'Monetization',
    prompt: "Tiered subscription management with Stripe or LemonSqueezy integration.",
    subcategories: [
      { id: 'tiers', label: 'Pricing Plans', description: 'Support for Free, Pro, and Enterprise tiers.' },
      { id: 'webhooks', label: 'Stripe Webhooks', description: 'Listen for checkout.session.completed and subscriptions.' },
      { id: 'portal', label: 'Customer Portal', description: 'Self-serve billing management for users.' }
    ]
  },
  {
    id: 'eco-product-grid',
    category: 'ecommerce',
    name: 'Discovery Catalog',
    icon: <Store className="w-4 h-4" />,
    badge: 'Storefront',
    prompt: "High-performance product listing with search, filters, and dynamic sorting.",
    subcategories: [
      { id: 'faceted', label: 'Faceted Filters', description: 'Category, price, and attribute filtering logic.' },
      { id: 'virt-grid', label: 'Virtual Grid', description: 'Virtualized list for large product catalogs.' },
      { id: 'search', label: 'Instant Search', description: 'Real-time keyword matching across inventory.' }
    ]
  },
  {
    id: 'eco-checkout',
    category: 'ecommerce',
    name: 'Unified Checkout',
    icon: <Truck className="w-4 h-4" />,
    badge: 'Conversion',
    prompt: "Optimized multi-step checkout with address validation and payment processing.",
    subcategories: [
      { id: 'cart-logic', label: 'Atomic Cart', description: 'Persistent local storage or DB synced shopping cart.' },
      { id: 'shipping', label: 'Shipping Rates', description: 'Integration with carriers for real-time calculation.' },
      { id: 'guest', label: 'Guest Checkout', description: 'Allow orders without mandatory user accounts.' }
    ]
  },
  {
    id: 'ai-rag-pipeline',
    category: 'ai',
    name: 'Knowledge RAG',
    icon: <BrainCircuit className="w-4 h-4" />,
    badge: 'Intelligence',
    prompt: "Retrieval Augmented Generation pipeline for chatting with custom datasets.",
    subcategories: [
      { id: 'embeddings', label: 'Vector Embeddings', description: 'Chunking and storage in pgvector or Pinecone.' },
      { id: 'search', label: 'Semantic Search', description: 'Contextual retrieval based on query similarity.' },
      { id: 'stream', label: 'Chat Streaming', description: 'Real-time UI updates for model responses.' }
    ]
  },
  {
    id: 'ai-workbench',
    category: 'ai',
    name: 'Agent Playground',
    icon: <Terminal className="w-4 h-4" />,
    badge: 'Workflows',
    prompt: "Collaborative workbench for designing and testing AI agent prompts.",
    subcategories: [
      { id: 'logs', label: 'Prompt Logs', description: 'Version history and performance tracking.' },
      { id: 'tokens', label: 'Cost Monitor', description: 'Token-based usage tracking per project.' },
      { id: 'tools', label: 'Function Calling', description: 'Dynamic tool definition for agent interaction.' }
    ]
  },
  {
    id: 'mkt-hero',
    category: 'marketing',
    name: 'Conversion Hero',
    icon: <Rocket className="w-4 h-4" />,
    badge: 'Landing',
    prompt: "High-impact hero section with clear CTAs and social proof.",
    subcategories: [
      { id: 'ab', label: 'A/B Testing', description: 'Logic for serving variant headlines.' },
      { id: 'scroll', label: 'Parallax Effects', description: 'Subtle scroll-triggered animations.' },
      { id: 'cta', label: 'Primary Action', description: 'Focus-grabbing primary button components.' }
    ]
  },
  {
    id: 'mkt-pricing',
    category: 'marketing',
    name: 'Premium Tables',
    icon: <Table2 className="w-4 h-4" />,
    badge: 'Growth',
    prompt: "Interactive pricing comparisons with feature checklists and toggle billing.",
    subcategories: [
      { id: 'toggle', label: 'Annual Toggle', description: 'Smooth switch between monthly/yearly billing.' },
      { id: 'highlight', label: 'Popular Badge', description: 'Visual emphasis for high-conversion tiers.' },
      { id: 'faq', label: 'Context FAQ', description: 'Inline answers for common billing questions.' }
    ]
  },
  {
    id: 'app-shell',
    category: 'application',
    name: 'Workspace Shell',
    icon: <Layout className="w-4 h-4" />,
    badge: 'Layout',
    prompt: "Enterprise-ready application shell with sidebar, breadcrumbs, and command bar.",
    subcategories: [
      { id: 'k-bar', label: 'Command Menu', description: 'Global CMD+K search and navigation palette.' },
      { id: 'sidebar', label: 'Pinned Nav', description: 'Stateful, collapsible side navigation.' },
      { id: 'notif', label: 'Toast Stack', description: 'Unified notification event bus for feedback.' }
    ]
  },
  {
    id: 'app-data-grid',
    category: 'application',
    name: 'Management Table',
    icon: <Table2 className="w-4 h-4" />,
    badge: 'Admin',
    prompt: "Rich data table with bulk actions, CSV export, and inline editing.",
    subcategories: [
      { id: 'bulk', label: 'Multi-Select', description: 'Checkbox-based batch status updates.' },
      { id: 'filters', label: 'Save Views', description: 'User-specific custom filter persistence.' },
      { id: 'export', label: 'Data Sync', description: 'Logic for downloading filtered JSON/CSV.' }
    ]
  },
  {
    id: 'sys-notifications',
    category: 'system',
    name: 'Unified Notify',
    icon: <BellRing className="w-4 h-4" />,
    badge: 'Automation',
    prompt: "Multi-channel notification engine (Email, Push, In-App).",
    subcategories: [
      { id: 'queue', label: 'Event Queue', description: 'Async processing for high-volume alerts.' },
      { id: 'pref', label: 'User Settings', description: 'Granular opting in/out of specific channels.' },
      { id: 'temp', label: 'Dynamic Templates', description: 'Handlebars or React Email based alerting.' }
    ]
  },
  {
    id: 'sys-storage',
    category: 'system',
    name: 'Asset Manager',
    icon: <HardDriveDownload className="w-4 h-4" />,
    badge: 'Storage',
    prompt: "Secure file management with signed URLs and image processing.",
    subcategories: [
      { id: 'drop', label: 'Smart Upload', description: 'Resumable, chunked file uploading.' },
      { id: 'thumb', label: 'Auto-Thumbnails', description: 'On-the-fly resizing for media previews.' },
      { id: 'cdn', label: 'Signed Links', description: 'Temporary access control for private files.' }
    ]
  }
];

const FRAMEWORKS: Framework[] = ['Next.js', 'React', 'Vue 3', 'SvelteKit', 'Astro'];
const STYLING: Styling[] = ['Shadcn/UI', 'Tailwind CSS', 'Chakra UI', 'Styled Components', 'CSS Modules'];
const BACKENDS: Backend[] = ['Supabase', 'Appwrite', 'Pocketbase', 'PostgreSQL', 'N8N (Workflows)'];

const ITEMS_PER_PAGE = 4;

const TaskCard: React.FC<{ task: TaskItem }> = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);
  const priorityColor = {
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
  };

  return (
    <div className={`p-4 md:p-5 bg-slate-950 border transition-all rounded-[1.5rem] md:rounded-[2rem] group ${isOpen ? 'border-indigo-500/50 shadow-xl shadow-indigo-500/5' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className="flex items-start gap-3 md:gap-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-[10px] flex items-center justify-center font-black text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0">{task.id}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
            <h5 className="font-bold text-slate-100 text-sm truncate">{task.title}</h5>
            <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${priorityColor[task.priority]}`}>{task.priority}</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
        </div>
        <button className="p-2 text-slate-500 group-hover:text-white transition-colors">{isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
      </div>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-900 space-y-5 md:space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div>
            <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Info className="w-3 h-3" /> Implementation Logic</h6>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 md:p-4 rounded-xl md:rounded-2xl">{task.details}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div>
              <h6 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2"><BadgeCheck className="w-3 h-3" /> Test Strategy</h6>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">{task.testStrategy}</p>
            </div>
            <div>
              <h6 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FolderTree className="w-3 h-3" /> Impacted Files</h6>
              <div className="flex flex-wrap gap-1.5">{task.files_involved.map(f => (<span key={f} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-mono text-slate-500">{f}</span>))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rawPrompt, setRawPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'architecture' | 'files'>('tasks');
  const [sources, setSources] = useState<Source[]>([]);
  const [activeBlueprints, setActiveBlueprints] = useState<SelectedBlueprint[]>([]);
  const [selectedBlueprintForModal, setSelectedBlueprintForModal] = useState<Blueprint | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [config, setConfig] = useState<Omit<PromptConfig, 'sources'>>({
    framework: 'Next.js',
    styling: 'Shadcn/UI',
    backend: 'Supabase',
    tooling: ['TypeScript', 'Zod', 'React Hook Form'],
    providers: ['Novu (In-App/Infra)', 'Resend (Email)'],
    customContext: ''
  });

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
          type: file.type 
        }]);
      };
      reader.readAsText(file);
    });
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const data = await optimizePrompt(rawPrompt, { ...config, sources, selectedBlueprints: activeBlueprints });
      setResult(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const removeActiveBlueprint = (blueprintId: string) => {
    setActiveBlueprints(prev => prev.filter(b => b.blueprintId !== blueprintId));
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-x-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[1000px] h-[300px] md:h-[600px] bg-indigo-600/10 blur-[60px] md:blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-purple-600/5 blur-[50px] md:blur-[100px] rounded-full" />
        <header className="absolute top-0 w-full p-4 md:p-8 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-lg shadow-indigo-600/20"><Code2 className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>
            <span className="font-bold text-lg md:text-xl tracking-tight">DevPrompt</span>
          </div>
          <button onClick={() => setView('app')} className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm font-bold transition-all border border-slate-700 shadow-xl">Sign In</button>
        </header>
        <div className="max-w-4xl w-full text-center space-y-8 md:space-y-12 relative z-10 pt-16 md:pt-0">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]"><PlayCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Professional Grade</div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">Architect Your <span className="text-indigo-500">App</span> From Zero.</h1>
            <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4 md:px-0">Select high-fidelity functional modules and define your stack to generate master-level technical specs for any modern project.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 md:px-0">
            <button onClick={() => setView('app')} className="group w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-600 text-white font-black text-xs md:text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 active:scale-95">Enter Designer <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-950/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setView('landing')} className="flex items-center gap-2 text-slate-100 hover:text-indigo-400 transition-colors">
              <div className="bg-indigo-600 p-1.5 rounded-lg"><Code2 className="w-5 h-5 text-white" /></div>
              <span className="text-sm font-bold tracking-tight">DevPrompt</span>
            </button>
            <div className="h-4 w-px bg-slate-800 mx-2 hidden md:block" />
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest hidden md:block">Architect Dashboard</div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/20" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
            <div className="xl:col-span-5 space-y-6">
              {/* Section 1: Modules */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl flex flex-col">
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base md:text-lg font-bold flex items-center gap-2"><Terminal className="text-indigo-400 w-4 h-4 md:w-5 md:h-5" /> 1. Functional Modules</h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500/50 transition-all">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input type="text" placeholder="Search features..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none" />
                    </div>
                    <button 
                      onClick={() => setIsFilterModalOpen(true)}
                      className={`p-2.5 rounded-xl border transition-all ${activeCategory !== 'all' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Top: Only Active Category Filter Chips */}
                  {activeCategory !== 'all' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600/10 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-400">
                        Filter: {CATEGORIES.find(c => c.id === activeCategory)?.label}
                        <button onClick={() => setActiveCategory('all')} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-h-[260px] flex flex-col justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    {currentBlueprints.map(bp => {
                      const isActive = activeBlueprints.some(ab => ab.blueprintId === bp.id);
                      return (
                        <button key={bp.id} onClick={() => setSelectedBlueprintForModal(bp)} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all text-left group h-fit ${isActive ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800'}`}>
                          <div className={`p-2 rounded-lg md:rounded-xl mb-2 md:mb-3 transition-colors w-fit shrink-0 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 group-hover:bg-slate-700'}`}>{bp.icon}</div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block mb-1 truncate">{bp.name}</span>
                            <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-mono tracking-widest">{bp.badge}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between shrink-0">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-all"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {/* Bottom: Selected Modules Section */}
                {activeBlueprints.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Boxes className="w-3 h-3 text-indigo-400" /> Selected Context Modules
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeBlueprints.map(ab => (
                        <div key={ab.blueprintId} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-slate-200 group hover:border-indigo-500/50 transition-all">
                          <span className="text-indigo-400">{ab.name}</span>
                          <button onClick={() => removeActiveBlueprint(ab.blueprintId)} className="text-slate-500 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Section 2: Tech Stack Selection */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl">
                <h2 className="text-base md:text-lg font-bold flex items-center gap-2 mb-6"><Settings2 className="text-indigo-400 w-4 h-4 md:w-5 md:h-5" /> 2. Tech Stack</h2>
                <div className="space-y-6">
                  {[ 
                    { label: 'Framework', options: FRAMEWORKS, key: 'framework' }, 
                    { label: 'Backend Infra', options: BACKENDS, key: 'backend' }, 
                    { label: 'Styling', options: STYLING, key: 'styling' } 
                  ].map(group => (
                    <div key={group.label}>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">{group.label}</label>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => setConfig({...config, [group.key]: opt as any})}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] md:text-xs font-bold transition-all ${config[group.key as keyof typeof config] === opt ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Project Context */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-base md:text-lg font-bold flex items-center gap-2"><BookOpen className="text-emerald-400 w-4 h-4 md:w-5 md:h-5" /> 3. Project Context</h2>
                   <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                   <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                 </div>
                 <div className="space-y-2">
                   {sources.length === 0 ? (
                     <div className="p-6 md:p-8 border-2 border-dashed border-slate-800 rounded-xl md:rounded-2xl text-center text-slate-600">
                        <FileText className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-widest">Optional PRDs or Schemas</p>
                     </div>
                   ) : sources.map(s => (
                     <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl group hover:border-indigo-500/30">
                       <div className="flex items-center gap-3 min-w-0"><FileText className="w-4 h-4 text-slate-500 shrink-0" /><span className="text-[10px] md:text-xs font-medium truncate">{s.name}</span></div>
                       <button onClick={() => setSources(prev => prev.filter(x => x.id !== s.id))} className="text-slate-500 hover:text-red-400 transition-all p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                   ))}
                 </div>
              </section>

              {/* Section 4: Manual Instructions */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base md:text-lg font-bold flex items-center gap-2"><Sparkles className="text-amber-400 w-4 h-4 md:w-5 md:h-5" /> 4. Requirements</h2>
                </div>
                <textarea 
                  value={rawPrompt} 
                  onChange={(e) => setRawPrompt(e.target.value)} 
                  placeholder="Describe any additional business logic, user stories, or edge cases..." 
                  className="w-full h-28 md:h-32 bg-slate-950 border border-slate-800 rounded-xl md:rounded-2xl p-4 md:p-5 text-xs md:text-sm leading-relaxed mb-6 focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none" 
                />
                <button onClick={handleOptimize} disabled={loading || (activeBlueprints.length === 0 && !rawPrompt.trim())} className="w-full py-3.5 md:py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                  {loading ? <><RefreshCcw className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Generating Speckit...</> : <><Zap className="w-4 h-4 md:w-5 md:h-5" /> Synthesize Architecture</>}
                </button>
              </section>
            </div>

            <div className="xl:col-span-7 min-h-[400px] flex flex-col">
              {!result && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-slate-800 rounded-[1.5rem] md:rounded-[3rem] bg-slate-900/10">
                  <PlayCircle className="w-12 h-12 md:w-16 md:h-16 text-slate-800 mb-4 md:mb-6" />
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tighter">Design Board Ready</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-xs md:text-base leading-relaxed">Synthesize selected modules and stack into a master coding specification.</p>
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 md:space-y-6 animate-pulse">
                  <div className="relative">
                     <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-ping"></div>
                     <RefreshCcw className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 animate-spin relative" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-600">Architecting Solutions</span>
                </div>
              ) : (
                <div className="flex flex-col flex-1 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex-1 flex flex-col min-h-0">
                    <div className="px-4 md:px-8 py-3 md:py-4 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                      <div className="flex gap-1 md:gap-2">
                        {[
                          { id: 'tasks', label: 'Backlog', icon: <ListTodo className="w-3 h-3 md:w-3.5 md:h-3.5" /> },
                          { id: 'architecture', label: 'Architecture', icon: <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" /> },
                          { id: 'files', label: 'FS Tree', icon: <FolderTree className="w-3 h-3 md:w-3.5 md:h-3.5" /> }
                        ].map(tab => (
                          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{tab.icon}{tab.label}</button>
                        ))}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(result?.fullMarkdownSpec || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">{copied ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <ClipboardList className="w-3 h-3 md:w-3.5 md:h-3.5" />}{copied ? 'Copied' : 'Copy Spec'}</button>
                    </div>
                    <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                      {activeTab === 'tasks' && (
                        <div className="space-y-6">
                           <div className="p-4 md:p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl md:rounded-3xl mb-4 md:mb-8 flex items-start gap-3 md:gap-4">
                             <div className="p-2 md:p-3 bg-indigo-600 rounded-lg md:rounded-2xl text-white shadow-lg shadow-indigo-600/20 shrink-0"><PlayCircle className="w-5 h-5 md:w-6 md:h-6" /></div>
                             <div className="flex-1 min-w-0">
                               <h4 className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 md:mb-2">Implementation Summary</h4>
                               <div className="text-[11px] md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{result?.coldStartGuide}</div>
                             </div>
                           </div>
                           <div className="flex items-center justify-between mb-2 px-1">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><ClipboardList className="w-3.5 h-3.5" /> Execution Plan</h4>
                             <span className="text-[9px] md:text-[10px] font-bold text-slate-600 tracking-wider">{result?.implementationPlan.length} ATOMIC TASKS</span>
                           </div>
                           <div className="space-y-3 md:space-y-4">{result?.implementationPlan.map((task) => (<TaskCard key={task.id} task={task} />))}</div>
                        </div>
                      )}
                      {activeTab === 'architecture' && (
                        <div className="space-y-6">
                           <div className="p-5 md:p-8 bg-slate-950 border border-slate-800 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 md:p-8 opacity-[0.03]"><ShieldCheck className="w-24 h-24 md:w-32 md:h-32" /></div>
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 md:mb-6 flex items-center gap-2 relative z-10"><Info className="w-4 h-4" /> Architectural Guards</h4>
                              <div className="text-[11px] md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap italic font-medium relative z-10">{result?.architectureNotes}</div>
                           </div>
                        </div>
                      )}
                      {activeTab === 'files' && (
                        <div className="p-5 md:p-8 bg-slate-950 border border-slate-800 rounded-2xl md:rounded-[2.5rem] font-mono relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 md:p-8 opacity-[0.03]"><FolderTree className="w-24 h-24 md:w-32 md:h-32" /></div>
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 md:mb-6 flex items-center gap-2 relative z-10"><FolderTree className="w-4 h-4" /> Directory Map</h4>
                           <pre className="text-[10px] md:text-xs text-indigo-300 leading-relaxed overflow-x-auto relative z-10 scrollbar-thin">{result?.directoryStructure}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Filter Categories Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsFilterModalOpen(false)} />
          <div className="relative bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600/20 p-2.5 rounded-xl text-indigo-400 shrink-0"><Filter className="w-5 h-5" /></div>
                <div><h3 className="text-lg font-black text-white">Filter Categories</h3><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Application Domains</p></div>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/20 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => { setActiveCategory(cat.id); setIsFilterModalOpen(false); }} 
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold border transition-all ${activeCategory === cat.id ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-xl' : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-400'}`}
                >
                  <span className={`${activeCategory === cat.id ? 'text-indigo-400' : 'text-slate-600'}`}>{cat.icon}</span>
                  {cat.label}
                  {activeCategory === cat.id && <Check className="w-4 h-4 ml-auto text-indigo-400" />}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
               <button onClick={() => setIsFilterModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Blueprint Detail Modal */}
      {selectedBlueprintForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedBlueprintForModal(null)} />
          <div className="relative bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="bg-indigo-600/20 p-3 md:p-4 rounded-xl md:rounded-3xl text-indigo-400 shrink-0">{selectedBlueprintForModal.icon}</div>
                <div><h3 className="text-lg md:text-2xl font-black text-white truncate">{selectedBlueprintForModal.name}</h3><p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1">Granular Modules</p></div>
              </div>
              <button onClick={() => setSelectedBlueprintForModal(null)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>
            <div className="p-4 md:p-10 space-y-3 md:space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar bg-slate-900/20">
              {selectedBlueprintForModal.subcategories.map(sub => (
                <label key={sub.id} className={`flex items-start gap-4 md:gap-6 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border transition-all cursor-pointer group ${selectedSubs.includes(sub.id) ? 'bg-indigo-600/10 border-indigo-500 shadow-xl' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}>
                  <div className="pt-1 shrink-0">
                    <input type="checkbox" className="hidden" checked={selectedSubs.includes(sub.id)} onChange={() => setSelectedSubs(prev => prev.includes(sub.id) ? prev.filter(x => x !== sub.id) : [...prev, sub.id])} />
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center border-2 ${selectedSubs.includes(sub.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 group-hover:border-slate-600'}`}>{selectedSubs.includes(sub.id) && <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm font-black text-slate-200 mb-0.5 md:mb-1 uppercase tracking-tight truncate">{sub.label}</div>
                    <div className="text-[10px] md:text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{sub.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-6 md:p-10 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row gap-3 md:gap-4">
              <button onClick={() => setSelectedBlueprintForModal(null)} className="flex-1 py-3 md:py-4 px-6 rounded-xl md:rounded-2xl border border-slate-800 text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={() => {
                const labels = selectedBlueprintForModal.subcategories.filter(s => selectedSubs.includes(s.id)).map(s => s.label);
                setActiveBlueprints(prev => {
                  const filtered = prev.filter(p => p.blueprintId !== selectedBlueprintForModal.id);
                  return [...filtered, { blueprintId: selectedBlueprintForModal.id, name: selectedBlueprintForModal.name, selectedSubLabels: labels }];
                });
                setSelectedBlueprintForModal(null);
                setSelectedSubs([]);
              }} disabled={selectedSubs.length === 0} className="flex-[2] py-3 md:py-4 px-6 rounded-xl md:rounded-2xl bg-indigo-600 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-2xl disabled:opacity-50 transition-all">Add to Context ({selectedSubs.length})</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
