
'use client';

import React, { useState } from 'react';
import { LandingView } from './components/LandingView.tsx';
import { DashboardView } from './components/DashboardView.tsx';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');

  return (
    <main className="min-h-screen bg-slate-950">
      {currentView === 'landing' ? (
        <LandingView onStart={() => setCurrentView('app')} />
      ) : (
        <DashboardView onBack={() => setCurrentView('landing')} />
      )}
    </main>
  );
}
