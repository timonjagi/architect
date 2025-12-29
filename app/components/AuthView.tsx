import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Code2, Mail, Lock, Loader2, ArrowRight, UserPlus } from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for a confirmation link!");
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 glow-bg pointer-events-none opacity-40" />

      <div className="w-full max-w-md relative z-10">
        <button onClick={onBack} className="mb-8 text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </button>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-white p-2 rounded-xl mb-4">
              <Code2 className="w-6 h-6 text-slate-950" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Architect Vault</h2>
            <p className="text-slate-500 text-sm mt-1">{isLogin ? 'Welcome back, Engineer' : 'Initialize your workspace'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-sm text-white focus:border-slate-500 outline-none transition-all placeholder:text-slate-800"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-sm text-white focus:border-slate-500 outline-none transition-all placeholder:text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center">{error}</div>}

            <button
              disabled={loading}
              className="w-full py-4 bg-white hover:bg-slate-200 text-slate-950 font-black text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Authorize Access' : 'Create Credentials')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? <><UserPlus className="w-3.5 h-3.5" /> No account? Sign up</> : <><Mail className="w-3.5 h-3.5" /> Have an account? Login</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
