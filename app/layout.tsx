import React, { useCallback, useEffect, useState } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthView } from './components/AuthView';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Architect',
  description: 'The Future of System Design',
};

interface RootLayoutProps {
  children?: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-slate-800 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-white/10`}>
        {children}
      </body>
    </html>
  );
}
