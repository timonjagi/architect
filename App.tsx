
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
  Filter, CreditCard, Layers, Briefcase, Boxes, Rocket, Shield, Megaphone, Monitor,
  Quote, Star, CheckCircle2, HelpCircle, MailCheck, Building2, BarChart, History,
  Image as ImageIcon, CreditCard as CardIcon, MapPin, BadgePercent, PackageSearch
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

const CATEGORIES = [
  { id: 'all', label: 'All Modules', icon: <Layers className="w-4 h-4" /> },
  { id: 'saas', label: 'SaaS Core', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'ai', label: 'AI & Data', icon: <Bot className="w-4 h-4" /> },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'application', label: 'Dashboards', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'system', label: 'Infrastructure', icon: <Cpu className="w-4 h-4" /> },
];

const BLUEPRINTS: Blueprint[] = [
  // SaaS Core
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
  
  // Application (Dashboards) Components
  {
    id: 'app-nav',
    category: 'application',
    name: 'Application Shell',
    icon: <Layout className="w-4 h-4" />,
    badge: 'Navigation',
    prompt: "Primary application structure with sidebars and global navigation.",
    subcategories: [
      { id: 'sidebar', label: 'Persistent Sidebar', description: 'Multi-level navigation with pinned/collapsed states.' },
      { id: 'command', label: 'Command Bar (CMD+K)', description: 'Global search and quick action palette.' },
      { id: 'header', label: 'Contextual Header', description: 'Dynamic breadcrumbs and user profile menu.' }
    ]
  },
  {
    id: 'app-tables',
    category: 'application',
    name: 'Data Management',
    icon: <Table2 className="w-4 h-4" />,
    badge: 'Admin',
    prompt: "Feature-rich data grids for managing complex resources.",
    subcategories: [
      { id: 'filters', label: 'Faceted Search', description: 'Advanced filtering, sorting, and saved views logic.' },
      { id: 'bulk', label: 'Bulk Actions', description: 'Multi-select logic for batch processing records.' },
      { id: 'inline', label: 'Inline Editing', description: 'Direct field updates without leaving the table view.' }
    ]
  },
  {
    id: 'app-dashboards',
    category: 'application',
    name: 'Analytics Panels',
    icon: <BarChart className="w-4 h-4" />,
    badge: 'Insights',
    prompt: "Visual data representation and metric tracking dashboards.",
    subcategories: [
      { id: 'stats', label: 'KPI Card Grid', description: 'Snapshot cards with trend indicators and sparklines.' },
      { id: 'charts', label: 'Interactive Charts', description: 'TimeSeries, Bar, and Pie charts with tooltips.' },
      { id: 'activity', label: 'Activity Feed', description: 'Real-time event log for system or user actions.' }
    ]
  },
  {
    id: 'app-settings',
    category: 'application',
    name: 'Account Settings',
    icon: <Settings2 className="w-4 h-4" />,
    badge: 'Preferences',
    prompt: "User profile, organization settings, and security controls.",
    subcategories: [
      { id: 'profile', label: 'Profile Editor', description: 'Avatar management and personal information forms.' },
      { id: 'security', label: 'Security Center', description: 'Password reset, 2FA, and active session management.' },
      { id: 'billing', label: 'Invoicing & History', description: 'Subscription details and downloadable PDF receipts.' }
    ]
  },
  {
    id: 'app-feedback',
    category: 'application',
    name: 'Notification Hub',
    icon: <BellRing className="w-4 h-4" />,
    badge: 'Messaging',
    prompt: "In-app alerts and notification management systems.",
    subcategories: [
      { id: 'center', label: 'Notification List', description: 'Unread indicators and mark-all-as-read logic.' },
      { id: 'toasts', label: 'Real-time Toasts', description: 'Ephemeral feedback for user success/error states.' },
      { id: 'prefs', label: 'Delivery Prefs', description: 'Granular controls for Email vs. Push notifications.' }
    ]
  },

  // E-commerce Components
  {
    id: 'eco-catalog',
    category: 'ecommerce',
    name: 'Product Discovery',
    icon: <Store className="w-4 h-4" />,
    badge: 'Storefront',
    prompt: "Browsing and search experience for product catalogs.",
    subcategories: [
      { id: 'filters', label: 'Faceted Filters', description: 'Filtering by size, color, price, and category.' },
      { id: 'grid', label: 'Smart Grids', description: 'Lazy-loading or paginated layouts with hover effects.' },
      { id: 'search', label: 'Instant Search', description: 'Type-ahead suggestions and keyword matching.' }
    ]
  },
  {
    id: 'eco-product',
    category: 'ecommerce',
    name: 'Product Details',
    icon: <PackageSearch className="w-4 h-4" />,
    badge: 'Inventory',
    prompt: "Deep-dive product pages with conversion focus.",
    subcategories: [
      { id: 'gallery', label: 'Image Gallery', description: 'Zoomable product photos and video support.' },
      { id: 'variants', label: 'Variant Selection', description: 'SKU-level logic for size, color, and stock.' },
      { id: 'reviews', label: 'Rating System', description: 'Customer reviews with photo uploads and helpfulness votes.' }
    ]
  },
  {
    id: 'eco-checkout',
    category: 'ecommerce',
    name: 'Checkout Funnel',
    icon: <Truck className="w-4 h-4" />,
    badge: 'Conversion',
    prompt: "Optimized multi-step flow from cart to confirmation.",
    subcategories: [
      { id: 'cart', label: 'Persistent Cart', description: 'Session-synced cart with promo code logic.' },
      { id: 'flow', label: 'Multi-step Pay', description: 'Shipping, address validation, and payment steps.' },
      { id: 'upsell', label: 'Cross-selling', description: 'Post-purchase or in-cart product recommendations.' }
    ]
  },
  {
    id: 'eco-account',
    category: 'ecommerce',
    name: 'Customer Portal',
    icon: <Users className="w-4 h-4" />,
    badge: 'Loyalty',
    prompt: "User history and personalized shopping workspace.",
    subcategories: [
      { id: 'orders', label: 'Order Tracking', description: 'Status updates, tracking links, and history.' },
      { id: 'wishlist', label: 'Saved Items', description: 'Favorites list with "Notify on Sale" logic.' },
      { id: 'address', label: 'Address Book', description: 'Management of multiple shipping and billing profiles.' }
    ]
  },

  // Marketing Components
  {
    id: 'mkt-hero',
    category: 'marketing',
    name: 'Conversion Hero',
    icon: <Rocket className="w-4 h-4" />,
    badge: 'Landing',
    prompt: "High-impact hero section with clear CTAs and social proof.",
    subcategories: [
      { id: 'split', label: 'Split Layout', description: 'Visual on one side, copy on the other with CTA.' },
      { id: 'centered', label: 'Centered Stack', description: 'Impactful centered typography for high focus.' },
      { id: 'video-bg', label: 'Video Ambient', description: 'Support for muted background video loops.' }
    ]
  },
  {
    id: 'mkt-features',
    category: 'marketing',
    name: 'Feature Showcase',
    icon: <CheckCircle2 className="w-4 h-4" />,
    badge: 'Product',
    prompt: "Comprehensive feature grids and detailed capability sections.",
    subcategories: [
      { id: 'grid', label: 'Icon Grid', description: 'Responsive grid with icons, titles, and descriptions.' },
      { id: 'side-by-side', label: 'Detailed Rows', description: 'Alternating image/text rows for deep-dives.' },
      { id: 'tabs', label: 'Feature Tabs', description: 'Switchable content views for complex products.' }
    ]
  },

  // AI & Data
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

  // Infrastructure
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
  const [isStackModalOpen, setIsStackModalOpen] = useState(false);
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <header className="absolute top-0 w-full p-8 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-md">
              <Code2 className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white uppercase">DevPrompt</span>
          </div>
          <button onClick={() => setView('app')} className="px-6 py-2 rounded-md bg-white hover:bg-slate-200 text-slate-950 text-sm font-bold transition-all">Initialize</button>
        </header>
        <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-900/50">
              <BadgeCheck className="w-4 h-4 text-white" /> Production Ready
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">Architect Your <span className="text-slate-500">Infrastructure</span> in Minutes.</h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Combine high-fidelity modules with modern tech stacks to generate master-level implementation specifications.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setView('app')} className="group w-full sm:w-auto px-12 py-5 rounded-md bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl">Start Designing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-white/20">
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('landing')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-white p-1 rounded-md">
                <Code2 className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white uppercase">DevPrompt</span>
            </button>
            <div className="h-4 w-px bg-slate-800 mx-2 hidden md:block" />
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Architect Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Status: Connected</div>
            <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center"><UserCheck className="w-4 h-4 text-white" /></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar max-w-[1600px] mx-auto w-full">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-5 space-y-8">
              {/* Section 1: Modules */}
              <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
                <div className="flex flex-col gap-5 mb-6">
                  <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500">
                    <Terminal className="w-4 h-4" /> 1. Functional Modules
                  </h2>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsFilterModalOpen(true)}
                      className={`h-11 px-4 rounded-md border flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest ${activeCategory !== 'all' ? 'bg-white border-white text-slate-950 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      Filter
                    </button>
                    <div className="flex-1 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-md px-4 h-11 focus-within:border-slate-500 transition-all">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input type="text" placeholder="Search modules..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:ring-0 text-xs w-full outline-none placeholder:text-slate-600" />
                    </div>
                  </div>

                  {activeCategory !== 'all' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-black text-white uppercase tracking-widest">
                        {CATEGORIES.find(c => c.id === activeCategory)?.label}
                        <button onClick={() => setActiveCategory('all')} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
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
                          setSelectedSubs(activeBlueprints.find(ab => ab.blueprintId === bp.id)?.selectedSubLabels.map(l => 
                            bp.subcategories.find(s => s.label === l)?.id || ''
                          ).filter(id => id !== '') || []);
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
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 rounded-md transition-all"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-30 rounded-md transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {activeBlueprints.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Boxes className="w-3.5 h-3.5" /> Selected Context
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeBlueprints.map(ab => (
                        <div key={ab.blueprintId} className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[9px] font-black text-slate-200 group hover:border-slate-600 transition-all uppercase tracking-widest">
                          {ab.name}
                          <button onClick={() => removeActiveBlueprint(ab.blueprintId)} className="text-slate-500 hover:text-white transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Section 2: Tech Stack */}
              <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500">
                    <Settings2 className="w-4 h-4" /> 2. Tech Stack
                  </h2>
                  <button onClick={() => setIsStackModalOpen(true)} className="p-1.5 bg-slate-900 border border-slate-800 text-white rounded-md hover:bg-slate-800 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase tracking-tight">
                    <span className="text-slate-500 font-black mr-1">FRAMEWORK:</span> {config.framework}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase tracking-tight">
                    <span className="text-slate-500 font-black mr-1">BACKEND:</span> {config.backend}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-100 uppercase tracking-tight">
                    <span className="text-slate-500 font-black mr-1">UI:</span> {config.styling}
                  </div>
                </div>
              </section>

              {/* Section 3: Project Context */}
              <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-slate-500"><BookOpen className="w-4 h-4" /> 3. Contextual Data</h2>
                   <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-slate-900 border border-slate-800 text-white rounded-md hover:bg-slate-800 transition-all"><Plus className="w-4 h-4" /></button>
                   <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                 </div>
                 <div className="space-y-2">
                   {sources.length === 0 ? (
                     <div className="py-8 border-2 border-dashed border-slate-900 rounded-xl text-center text-slate-600">
                        <FileText className="w-6 h-6 mx-auto mb-2 opacity-10" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Attach PRDs or Schemas</p>
                     </div>
                   ) : sources.map(s => (
                     <div key={s.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-md group hover:border-slate-600">
                       <div className="flex items-center gap-3 min-w-0"><FileText className="w-4 h-4 text-slate-500 shrink-0" /><span className="text-[10px] font-bold truncate text-slate-200 uppercase tracking-tight">{s.name}</span></div>
                       <button onClick={() => setSources(prev => prev.filter(x => x.id !== s.id))} className="text-slate-500 hover:text-red-400 transition-all p-1"><Trash2 className="w-4 h-4" /></button>
                     </div>
                   ))}
                 </div>
              </section>

              {/* Section 4: Manual Instructions */}
              <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm relative">
                <h2 className="text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-slate-500"><Sparkles className="w-4 h-4" /> 4. Custom Logic</h2>
                <textarea 
                  value={rawPrompt} 
                  onChange={(e) => setRawPrompt(e.target.value)} 
                  placeholder="Define user stories, business rules, or specific edge cases..." 
                  className="w-full h-32 bg-slate-900 border border-slate-800 rounded-md p-4 text-xs leading-relaxed mb-6 focus:border-slate-500 transition-all outline-none resize-none placeholder:text-slate-700" 
                />
                <button onClick={handleOptimize} disabled={loading || (activeBlueprints.length === 0 && !rawPrompt.trim())} className="w-full py-4 bg-white hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-md flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl">
                  {loading ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Architecting Spec...</> : <><Zap className="w-4 h-4" /> Generate Speckit</>}
                </button>
              </section>
            </div>

            <div className="xl:col-span-7 min-h-[400px] flex flex-col">
              {!result && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-900 rounded-xl bg-slate-950/40">
                  <PlayCircle className="w-16 h-16 text-slate-900 mb-6" />
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Plan Board</h3>
                  <p className="text-slate-600 max-w-sm mx-auto text-sm leading-relaxed">Combine modules and project context to build a master-grade coding plan.</p>
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                   <div className="w-12 h-12 bg-white rounded-lg animate-pulse flex items-center justify-center">
                    <RefreshCcw className="w-6 h-6 text-slate-950 animate-spin" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Generating Strategy</span>
                </div>
              ) : (
                <div className="flex flex-col flex-1 space-y-6 animate-in fade-in duration-300">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-0">
                    <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
                      <div className="flex gap-2">
                        {[
                          { id: 'tasks', label: 'Roadmap', icon: <ListTodo className="w-3.5 h-3.5" /> },
                          { id: 'architecture', label: 'Arch', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                          { id: 'files', label: 'FS Tree', icon: <FolderTree className="w-3.5 h-3.5" /> }
                        ].map(tab => (
                          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-white'}`}>{tab.icon}{tab.label}</button>
                        ))}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(result?.fullMarkdownSpec || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">{copied ? <Check className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />}{copied ? 'Copied' : 'Copy Spec'}</button>
                    </div>
                    <div className="p-6 md:p-10 flex-1 overflow-y-auto custom-scrollbar">
                      {activeTab === 'tasks' && (
                        <div className="space-y-8">
                           <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-5">
                             <div className="p-3 bg-white rounded-md text-slate-950 shrink-0"><PlayCircle className="w-5 h-5" /></div>
                             <div className="flex-1 min-w-0">
                               <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Kickoff Strategy</h4>
                               <div className="text-xs md:text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{result?.coldStartGuide}</div>
                             </div>
                           </div>
                           <div className="flex items-center justify-between mb-2 px-1">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">Implementation Phases</h4>
                             <span className="text-[10px] font-bold text-slate-700 tracking-wider">{result?.implementationPlan.length} MODULES</span>
                           </div>
                           <div className="space-y-4">{result?.implementationPlan.map((task) => (<TaskCard key={task.id} task={task} />))}</div>
                        </div>
                      )}
                      {activeTab === 'architecture' && (
                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-lg relative overflow-hidden">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-white" /> Architectural Constraints</h4>
                          <div className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{result?.architectureNotes}</div>
                        </div>
                      )}
                      {activeTab === 'files' && (
                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-lg font-mono relative overflow-hidden">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FolderTree className="w-4 h-4" /> Final Output Map</h4>
                           <pre className="text-[10px] md:text-xs text-slate-200 leading-relaxed overflow-x-auto scrollbar-thin">{result?.directoryStructure}</pre>
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

      {/* Stack Selection Modal */}
      {isStackModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-slate-950 border border-slate-800 rounded-lg w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-8 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-2 rounded-md border border-slate-800"><Settings2 className="w-4 h-4 text-white" /></div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Stack Config</h3>
              </div>
              <button onClick={() => setIsStackModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-8 bg-slate-950">
              {[ 
                { label: 'Framework', options: FRAMEWORKS, key: 'framework' }, 
                { label: 'Infrastructure / DB', options: BACKENDS, key: 'backend' }, 
                { label: 'Styling & Components', options: STYLING, key: 'styling' } 
              ].map(group => (
                <div key={group.label}>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">{group.label}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {group.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setConfig({...config, [group.key]: opt as any})}
                        className={`px-3 py-2.5 rounded-md border text-[10px] font-bold transition-all text-center ${config[group.key as keyof typeof config] === opt ? 'bg-white border-white text-slate-950 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-slate-800 flex justify-end">
              <button onClick={() => setIsStackModalOpen(false)} className="px-8 py-3 rounded-md bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 shadow-md active:scale-95 transition-all">Confirm Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Categories Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-slate-950 border border-slate-800 rounded-lg w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-2 rounded-md border border-slate-800"><Filter className="w-4 h-4 text-white" /></div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Select Category</h3>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => { setActiveCategory(cat.id); setIsFilterModalOpen(false); }} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat.id ? 'bg-white border-white text-slate-950 shadow-md' : 'bg-slate-900 border-slate-800 hover:text-white text-slate-400'}`}
                >
                  {cat.label}
                  {activeCategory === cat.id && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blueprint Detail Modal */}
      {selectedBlueprintForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-slate-950 border border-slate-800 rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-8 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">{selectedBlueprintForModal.icon}</div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedBlueprintForModal.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Select Sub-Modules</p>
                </div>
              </div>
              <button onClick={() => setSelectedBlueprintForModal(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar bg-slate-950">
              <div className="mb-4 p-4 border border-slate-800 bg-slate-900/30 rounded-md">
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">You can select specific granular sub-modules below, or just click "Add to Context" to include the core architecture of this feature.</p>
              </div>
              {selectedBlueprintForModal.subcategories.map(sub => (
                <label key={sub.id} className={`flex items-start gap-6 p-5 rounded-lg border transition-all cursor-pointer group ${selectedSubs.includes(sub.id) ? 'bg-white border-white text-slate-950 shadow-md' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                  <div className="pt-1 shrink-0">
                    <input type="checkbox" className="hidden" checked={selectedSubs.includes(sub.id)} onChange={() => setSelectedSubs(prev => prev.includes(sub.id) ? prev.filter(x => x !== sub.id) : [...prev, sub.id])} />
                    <div className={`w-5 h-5 rounded border-2 ${selectedSubs.includes(sub.id) ? 'bg-slate-950 border-slate-950' : 'border-slate-700 group-hover:border-slate-500'} flex items-center justify-center transition-colors`}>
                      {selectedSubs.includes(sub.id) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedSubs.includes(sub.id) ? 'text-slate-950' : 'text-slate-200'}`}>{sub.label}</div>
                    <div className={`text-[11px] font-medium leading-relaxed ${selectedSubs.includes(sub.id) ? 'text-slate-600' : 'text-slate-500'}`}>{sub.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setSelectedBlueprintForModal(null)} className="flex-1 py-3 px-6 rounded-md border border-slate-800 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-colors">Cancel</button>
              <button onClick={() => {
                const labels = selectedBlueprintForModal.subcategories.filter(s => selectedSubs.includes(s.id)).map(s => s.label);
                const finalLabels = labels.length > 0 ? labels : ['Core Feature Context'];
                
                setActiveBlueprints(prev => {
                  const filtered = prev.filter(p => p.blueprintId !== selectedBlueprintForModal.id);
                  return [...filtered, { blueprintId: selectedBlueprintForModal.id, name: selectedBlueprintForModal.name, selectedSubLabels: finalLabels }];
                });
                setSelectedBlueprintForModal(null);
                setSelectedSubs([]);
              }} className="flex-[2] py-3 px-6 rounded-md bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 shadow-md transition-all active:scale-95">
                {selectedSubs.length > 0 ? `Add ${selectedSubs.length} Modules` : 'Add Core Feature'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
