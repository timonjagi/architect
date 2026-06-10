'use client';

import React from 'react';
import Link from 'next/link';
import { Code2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-white/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-lg shadow-white/10">
              <Code2 className="w-8 h-8 text-slate-950" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Architect</h1>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-xl font-black text-white mb-3 uppercase tracking-tight">
            Authentication Failed
          </h2>

          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            The login link may have expired or is no longer valid. Please try signing in again.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-200 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-white/5"
          >
            Back to Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
