
import React, { useState, useRef } from 'react';
import { 
  Code2, 
  Terminal, 
  Sparkles, 
  Layers, 
  Database, 
  Palette, 
  Copy, 
  Check, 
  RefreshCcw,
  Zap,
  Github,
  ShieldCheck,
  Lock,
  LayoutDashboard,
  ShoppingBag,
  MousePointer2,
  Settings,
  BookOpen,
  FileText,
  Plus,
  Trash2,
  Paperclip,
  Info,
  BrainCircuit,
  Bell,
  MessageSquare,
  Smartphone,
  Mail,
  X,
  ChevronRight,
  Target,
  BarChart3,
  Bot,
  Users,
  CreditCard,
  LifeBuoy,
  History,
  FileCheck,
  Wallet,
  Receipt,
  Globe,
  Cpu,
  MousePointerSquareDashed,
  Truck,
  Box,
  Key
} from 'lucide-react';
import { Framework, Styling, Backend, Tooling, PromptConfig, OptimizationResult, Source, NotificationProvider } from './types';
import { optimizePrompt, contextualizeBlueprint } from './services/geminiService';

interface SubCategory {
  id: string;
  label: string;
  description: string;
}

interface Blueprint {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
  badge: string;
  subcategories: SubCategory[];
}

const BLUEPRINTS: Blueprint[] = [
  {
    id: 'saas',
    name: 'SaaS Foundation',
    icon: <Globe className="w-4 h-4" />,
    badge: 'Multi-Tenant',
    prompt: "A modern B2B SaaS architecture with organization-level scoping and multi-tenant data isolation.",
    subcategories: [
      { id: 'orgs', label: 'Org & Team Mgmt', description: 'Workspaces, invitations, and seat-based billing.' },
      { id: 'rbac', label: 'Granular RBAC', description: 'Fine-grained permissions and custom role builders.' },
      { id: 'usage', label: 'Feature Gating', description: 'Toggle functionality based on subscription tiers.' },
      { id: 'audit-logs', label: 'Global Audit Logs', description: 'Enterprise-grade activity tracking across the organization.' }
    ]
  },
  {
    id: 'devtools',
    name: 'Developer Platform',
    icon: <Cpu className="w-4 h-4" />,
    badge: 'Infrastructure',
    prompt: "An API-first platform for developers, focusing on developer experience (DX) and secure resource access.",
    subcategories: [
      { id: 'api-keys', label: 'API Key Management', description: 'Secret rotation, scoping, and usage limiting.' },
      { id: 'webhooks', label: 'Webhook Engine', description: 'Reliable event delivery with retry logic and signatures.' },
      { id: 'docs', label: 'Auto-generated Docs', description: 'Swagger/OpenAPI integration and code playgrounds.' },
      { id: 'sdk', label: 'SDK Generation', description: 'Patterns for type-safe client libraries in multiple languages.' }
    ]
  },
  {
    id: 'collab',
    name: 'Collaboration Tools',
    icon: <MousePointerSquareDashed className="w-4 h-4" />,
    badge: 'Real-time',
    prompt: "Multiplayer workspace functionality enabling users to interact in real-time on shared documents or canvases.",
    subcategories: [
      { id: 'presence', label: 'User Presence', description: 'Active status, "who is here", and cursor tracking.' },
      { id: 'optimistic', label: 'Optimistic UI', description: 'Patterns for low-latency updates with server reconciliation.' },
      { id: 'history-stack', label: 'Conflict Resolution', description: 'OT or CRDT-based merging for simultaneous edits.' },
      { id: 'shared-folders', label: 'Shared Permissions', description: 'Inherited access levels for complex folder trees.' }
    ]
  },
  {
    id: 'logistics',
    name: 'Logistics & Ops',
    icon: <Truck className="w-4 h-4" />,
    badge: 'Supply Chain',
    prompt: "A robust operational system for tracking physical inventory, shipping, and fulfillment cycles.",
    subcategories: [
      { id: 'inventory', label: 'Warehouse Management', description: 'Stock levels, SKU tracking, and low-stock alerts.' },
      { id: 'shipping', label: 'Carrier Integration', description: 'Real-time rates and label generation for DHL/UPS/FedEx.' },
      { id: 'routing', label: 'Last-Mile Routing', description: 'Geofencing and delivery route optimization logic.' },
      { id: 'returns', label: 'Reverse Logistics', description: 'RMA workflows and restocking processes.' }
    ]
  },
  {
    id: 'fintech',
    name: 'Fintech / Payouts',
    icon: <Wallet className="w-4 h-4" />,
    badge: 'Compliance',
    prompt: "Highly secure financial workflows for processing payments, handling ledgers, and KYC compliance.",
    subcategories: [
      { id: 'ledger', label: 'Double-Entry Ledger', description: 'Immutable transaction records for financial integrity.' },
      { id: 'escrow', label: 'Escrow / Holding', description: 'Logic for multi-party transaction settlement.' },
      { id: 'payouts-auto', label: 'Automated Payouts', description: 'Batch processing for vendor transfers and tax withholding.' },
      { id: 'fraud', label: 'Fraud Detection', description: 'Rule-based and behavioral analysis for suspicious activity.' }
    ]
  },
  {
    id: 'ai',
    name: 'AI Agentic Apps',
    icon: <Bot className="w-4 h-4" />,
    badge: 'Future-Proof',
    prompt: "Next-gen application patterns using LLMs for automation, chat, and document intelligence.",
    subcategories: [
      { id: 'rag-flow', label: 'Advanced RAG', description: 'Vector embeddings, chunking strategies, and hybrid search.' },
      { id: 'streaming-ui', label: 'Streaming Chat', description: 'Rich markdown, LaTeX, and code block execution in UI.' },
      { id: 'agents', label: 'Agent Workflows', description: 'Multi-step planning and tool-calling orchestration.' },
      { id: 'guardrails', label: 'Safety & Guardrails', description: 'Moderation filters and PII redaction logic.' }
    ]
  },
  {
    id: 'ecommerce',
    name: 'D2C Storefront',
    icon: <ShoppingBag className="w-4 h-4" />,
    badge: 'High Scale',
    prompt: "A performance-optimized direct-to-consumer store with complex product logic and global checkout.",
    subcategories: [
      { id: 'facets', label: 'Dynamic Filtering', description: 'Fast, faceted search across thousands of attributes.' },
      { id: 'cart-engine', label: 'Persistent Cart', description: 'Cross-device cart syncing and recovery reminders.' },
      { id: 'promos', label: 'Discount Engine', description: 'Coupons, flash sales, and tiered bulk pricing.' },
      { id: 'localization', label: 'Multi-currency/Region', description: 'Global tax (VAT/Sales) and localized content.' }
    ]
  },
  {
    id: 'content',
    name: 'Media & CMS',
    icon: <BookOpen className="w-4 h-4" />,
    badge: 'SEO-First',
    prompt: "A content-rich platform for publishers, focusing on performance, SEO, and editorial workflows.",
    subcategories: [
      { id: 'editorial', label: 'Editorial Pipeline', description: 'Drafting, peer review, and scheduling states.' },
      { id: 'media-lib', label: 'Asset Optimization', description: 'On-the-fly image resizing and video transcoding.' },
      { id: 'seo-dynamic', label: 'Meta & JSON-LD', description: 'Automated schema generation for search engine rich results.' },
      { id: 'personalization', label: 'Content Feed', description: 'Recommendation engine based on user reading habits.' }
    ]
  }
];

const PROVIDERS: { name: NotificationProvider; icon: React.ReactNode; color: string }[] = [
  { name: 'Novu (In-App/Infra)', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-orange-600 border-orange-500' },
  { name: 'Resend (Email)', icon: <Mail className="w-3.5 h-3.5" />, color: 'bg-white text-black border-slate-200' },
  { name: 'Twilio (SMS)', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'bg-red-600 border-red-500' },
  { name: 'OneSignal (Push)', icon: <Smartphone className="w-3.5 h-3.5" />, color: 'bg-indigo-600 border-indigo-500' },
];

const App: React.FC = () => {
  const [rawPrompt, setRawPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextualizing, setContextualizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [config, setConfig] = useState<Omit<PromptConfig, 'sources'>>({
    framework: 'Next.js',
    styling: 'Shadcn/UI',
    backend: 'Supabase',
    tooling: ['TypeScript', 'Zod', 'React Hook Form'],
    providers: ['Novu (In-App/Infra)', 'Resend (Email)'],
    customContext: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newSource: Source = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content,
          type: file.type || 'text/plain'
        };
        setSources(prev => [...prev, newSource]);
      };
      reader.readAsText(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const toggleSubcategory = (id: string) => {
    setSelectedSubs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const confirmBlueprint = async () => {
    if (!selectedBlueprint) return;
    
    const subLabels = selectedBlueprint.subcategories
      .filter(s => selectedSubs.includes(s.id))
      .map(s => s.label);
    
    const basePrompt = `${selectedBlueprint.prompt} Implementation focus: ${subLabels.join(', ')}.`;
    
    setContextualizing(true);
    setSelectedBlueprint(null);
    setRawPrompt(`Synthesizing blueprint with selected modules...`);
    
    const finalPrompt = await contextualizeBlueprint(selectedBlueprint.name, basePrompt, sources);
    setRawPrompt(finalPrompt);
    setContextualizing(false);
    setSelectedSubs([]);
  };

  const handleOptimize = async () => {
    if (!rawPrompt.trim() || contextualizing) return;
    setLoading(true);
    try {
      const data = await optimizePrompt(rawPrompt, { ...config, sources });
      setResult(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleProvider = (provider: NotificationProvider) => {
    const newProviders = config.providers.includes(provider)
      ? config.providers.filter(p => p !== provider)
      : [...config.providers, provider];
    setConfig({ ...config, providers: newProviders });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      
      {/* Blueprint Detail Modal */}
      {selectedBlueprint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedBlueprint(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600/20 p-2 rounded-xl text-indigo-400">
                  {selectedBlueprint.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{selectedBlueprint.name}</h3>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Select target sub-modules</p>
                </div>
              </div>
              <button onClick={() => setSelectedBlueprint(null)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {selectedBlueprint.subcategories.map((sub) => (
                <label 
                  key={sub.id} 
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                    selectedSubs.includes(sub.id) 
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.1)]' 
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedSubs.includes(sub.id)}
                      onChange={() => toggleSubcategory(sub.id)}
                    />
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      selectedSubs.includes(sub.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 group-hover:border-slate-600'
                    }`}>
                      {selectedSubs.includes(sub.id) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200">{sub.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{sub.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex gap-3">
              <button 
                onClick={() => setSelectedBlueprint(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBlueprint}
                disabled={selectedSubs.length === 0}
                className="flex-[2] py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-800 shadow-lg shadow-indigo-600/20"
              >
                <Target className="w-4 h-4" />
                Contextualize Selection ({selectedSubs.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DevPrompt <span className="text-indigo-400">Optimizer</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Stack Explorer</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-4 h-4" /> Repo
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold">1. Engineering Context</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Client Framework</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Next.js', 'React', 'Vue 3', 'SvelteKit'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setConfig({ ...config, framework: f as Framework })}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        config.framework === f 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Self-Hostable Infrastructure</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Supabase', 'Appwrite', 'Pocketbase', 'PostgreSQL'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setConfig({ ...config, backend: b as Backend })}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        config.backend === b 
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">UI & Logic Styling</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Shadcn/UI', 'Tailwind CSS', 'Chakra UI', 'CSS Modules'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setConfig({ ...config, styling: s as Styling })}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        config.styling === s 
                          ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Messaging & Notifications</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => toggleProvider(p.name)}
                      className={`px-3 py-2 text-[11px] font-bold rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        config.providers.includes(p.name)
                          ? `${p.color} text-white shadow-lg`
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {p.icon}
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold">2. Knowledge Base (RAG)</h2>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-400/10 rounded-full">
                <div className={`w-2 h-2 rounded-full ${sources.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'}`}></div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">{sources.length} Context Sources</span>
              </div>
            </div>

            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept=".txt,.md,.json,.prd" 
                  onChange={handleFileUpload} 
                />
                <div className="bg-slate-800 group-hover:bg-indigo-600/20 p-2 rounded-lg w-fit mx-auto mb-2 transition-colors">
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                </div>
                <p className="text-xs font-bold text-slate-400 mb-1 group-hover:text-slate-200">Upload PRD or Design Guide</p>
                <p className="text-[10px] text-slate-600 leading-tight italic">AI will parse these for specific business rules.</p>
              </div>

              {sources.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {sources.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg group">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-[11px] font-medium text-slate-300 truncate">{s.name}</span>
                      </div>
                      <button 
                        onClick={() => removeSource(s.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {contextualizing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                <BrainCircuit className="w-10 h-10 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Merging Strategy...</span>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold">3. Feature Specification</h2>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product Blueprints</label>
                {sources.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 animate-pulse">
                    <BrainCircuit className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">RAG Context Active</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-64 overflow-y-auto custom-scrollbar pr-1">
                {BLUEPRINTS.map((bp) => (
                  <button
                    key={bp.id}
                    onClick={() => setSelectedBlueprint(bp)}
                    disabled={contextualizing}
                    className="flex flex-col items-start p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-slate-700 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="bg-slate-800 group-hover:bg-indigo-600 p-1.5 rounded-lg mb-2 transition-colors">
                      {React.cloneElement(bp.icon as React.ReactElement, { className: 'w-4 h-4 text-slate-300 group-hover:text-white' })}
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 block mb-1 truncate w-full">{bp.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-900 uppercase leading-none">{bp.badge}</span>
                      <ChevronRight className="w-2.5 h-2.5 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              placeholder="Or manually describe required behavior and components here..."
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none mb-4 scrollbar-thin text-sm leading-relaxed"
            />
            
            <button
              onClick={handleOptimize}
              disabled={loading || !rawPrompt.trim() || contextualizing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  Building Architecture Strategy...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate High-Fidelity Prompt
                </>
              )}
            </button>
          </section>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse"></div>
                <div className="relative bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl">
                  <Zap className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight">Standardized Architecture Generator</h3>
              <p className="text-slate-500 max-sm:text-xs max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                Transform high-level intent into implementation-ready technical prompts for SaaS, E-Commerce, DevTools, and Logistics.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                 <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 text-left hover:border-slate-700 transition-colors group">
                    <ShieldCheck className="w-6 h-6 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-sm font-bold text-slate-200 mb-1 tracking-wide uppercase">General Purpose</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">Blueprints covering major archetypes from Multi-tenancy to AI-Agents.</p>
                 </div>
                 <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 text-left hover:border-slate-700 transition-colors group">
                    <Target className="w-6 h-6 text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-sm font-bold text-slate-200 mb-1 tracking-wide uppercase">Stack Aware</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">Optimized for your selected framework and self-hostable backend services.</p>
                 </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-lg"></div>
                <div className="h-6 bg-slate-800 rounded-lg w-48"></div>
              </div>
              <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-center">
                 <div className="flex flex-col items-center gap-3">
                   <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                   <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Synthesizing Context...</span>
                 </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="font-bold text-sm tracking-tight">Engineering Implementation Prompt</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(result.optimizedPrompt)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy for AI Generator'}
                  </button>
                </div>
                <div className="p-6">
                  <div className="mono text-[13px] leading-relaxed text-slate-300 bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-auto max-h-[500px] whitespace-pre-wrap selection:bg-indigo-500/30 scrollbar-thin">
                    {result.optimizedPrompt}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-100 uppercase text-xs tracking-[0.2em]">Architecture Decisions</h3>
                  </div>
                  <p className="text-[13px] text-slate-400 leading-relaxed italic relative z-10">
                    {result.architectureNotes}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400">
                      <Palette className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-100 uppercase text-xs tracking-[0.2em]">Validated Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedStack.split(',').map((tech, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-950 text-slate-300 rounded-lg text-[11px] font-mono border border-slate-800 hover:border-slate-600 transition-colors cursor-default">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto py-12 bg-slate-950 border-t border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="bg-slate-900 p-1 rounded-lg shadow-lg shadow-indigo-600/10">
                <Code2 className="w-6 h-6 text-indigo-500" />
              </div>
              <span className="font-bold text-lg tracking-tight">DevPrompt <span className="text-slate-500">3.0</span></span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed italic">
              "Standardizing the interface between engineering intent and AI code generation."
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Built For</h4>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {['Supabase', 'Novu', 'Resend', 'Twilio', 'OneSignal', 'Drizzle', 'Real-time'].map(s => (
                <span key={s} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-500 text-[9px] rounded-lg uppercase font-bold tracking-tighter hover:text-slate-300 transition-colors cursor-default">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center md:items-end">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Powered by</div>
            <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2 shadow-inner">
               <Sparkles className="w-4 h-4 text-indigo-400" />
               <span className="text-xs font-bold text-slate-300">Gemini 3.0 Flash-Lite</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-900/30 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-600 text-[10px] font-mono uppercase tracking-widest">
          <span>© {new Date().getFullYear()} PROMPT ENGINE LABS</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Open Source</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
