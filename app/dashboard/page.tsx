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
      <DashboardView onBack={handleBack} />
    </div>
  );
}
