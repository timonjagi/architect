'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from '../components/DashboardView';

export default function DashboardPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="w-full min-h-screen">
      <React.Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" /></div>}>
        <DashboardView onBack={handleBack} />
      </React.Suspense>
    </div>
  );
}
