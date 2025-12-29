'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthView } from '../components/AuthView';

export default function DashboardPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="w-full min-h-screen">
      <AuthView onSuccess={() => router.push('/dashboard')} onBack={handleBack} />
    </div>
  );
}