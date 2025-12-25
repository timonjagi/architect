'use client';

import React, { useState, useCallback } from 'react';
import { LandingView } from './components/LandingView.tsx';
import { DashboardView } from './components/DashboardView.tsx';

/**
 * Main application entry point using state-based navigation.
 * This avoids common routing issues in static deployment environments.
 */
export default function Home() {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  const showApp = useCallback(() => setView('app'), []);
  const showLanding = useCallback(() => setView('landing'), []);

  return (
    <div className="w-full min-h-screen">
      {view === 'landing' ? (
        <LandingView onStart={showApp} />
      ) : (
        <DashboardView onBack={showLanding} />
      )}
    </div>
  );
}