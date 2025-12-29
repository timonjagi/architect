'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingView } from './components/LandingView';

/**
 * Landing page route.
 */
export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full min-h-screen">
      <LandingView onStart={handleStart} />
    </div>
  );
}
