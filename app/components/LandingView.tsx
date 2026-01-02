
import React from 'react';
import {
  ArrowRight, Rocket, Shield, Zap, Code2, Globe, Layers,
  Sparkles, CheckCircle2, Layout, Database, Smartphone
} from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
  user?: any;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, user }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg">
              <Code2 className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-black text-lg tracking-tighter text-white uppercase">Architect</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Features</a>
            <a href="#blueprints" className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Blueprints</a>
            <button
              onClick={onStart}
              className="px-6 py-2.5 rounded-full bg-white text-slate-950 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              {user ? 'Go to Dashboard' : 'Launch App'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] glow-bg pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="w-4 h-4 text-white" />
            The Future of System Design
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            From Idea to <br />
            <span className="text-slate-500">Infrastructure</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000">
            Stop writing vague prompts. Architect complex SaaS, E-commerce, and AI platforms using a visual blueprint system designed for senior engineers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <button
              onClick={onStart}
              className="group px-10 py-5 rounded-full bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              {user ? 'Open Your Dashboard' : 'Start Building Now'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 rounded-full border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="border-y border-white/5 bg-slate-950/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Blueprints', val: '50+' },
              { label: 'Frameworks', val: '05' },
              { label: 'Time Saved', val: '90%' },
              { label: 'Accuracy', val: '99%' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-black text-white mb-1">{stat.val}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase mb-6">Engineered for Complexity</h2>
            <p className="text-slate-400 max-w-xl mx-auto font-medium">Architect isn't just a text box. It's an IDE for system specifications.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'High-Fidelity Blueprints',
                desc: 'Pre-configured architectural modules for SaaS, Dashboards, and AI RAG pipelines.',
                icon: <Layers className="w-6 h-6" />,
              },
              {
                title: 'Tech-Stack Native',
                desc: 'Optimized logic for Next.js Server Actions, Supabase RLS, and Tailwind styling.',
                icon: <Zap className="w-6 h-6" />,
              },
              {
                title: 'Atomic Task Lists',
                desc: 'Generates step-by-step implementation roadmaps with unit testing strategies.',
                icon: <CheckCircle2 className="w-6 h-6" />,
              }
            ].map(feat => (
              <div key={feat.title} className="p-10 rounded-2xl bg-slate-900/30 border border-white/5 hover:border-white/10 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section id="blueprints" className="py-32 bg-slate-900/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase mb-6">Battle-Tested Components</h2>
              <p className="text-slate-400 font-medium">Choose from dozens of production-ready modules inspired by the world's best design systems.</p>
            </div>
            <button onClick={onStart} className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
              Explore All Blueprints <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'SaaS Billing', icon: <Database /> },
              { name: 'Analytics Dashboards', icon: <Layout /> },
              { name: 'E-commerce Checkout', icon: <Smartphone /> },
              { name: 'AI Workflows', icon: <Sparkles /> },
              { name: 'Auth Systems', icon: <Shield /> },
              { name: 'Marketing Heroes', icon: <Rocket /> },
              { name: 'Global Search', icon: <Globe /> },
              { name: 'Data Grids', icon: <Layout /> },
            ].map(item => (
              <div key={item.name} className="p-8 rounded-xl bg-slate-950 border border-white/5 hover:border-white/20 transition-all flex flex-col items-center text-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-lg text-slate-500 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <div className="bg-white p-1 rounded-md">
              <Code2 className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white uppercase">Architect</span>
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            © 2024 Architect. Built for the era of AI-native engineering.
          </p>
        </div>
      </footer>
    </div>
  );
};
