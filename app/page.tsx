'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingView } from './components/LandingView';
import { createClient } from '@/lib/supabase/client';

/**
 * Landing page route.
 */
export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleStart = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full min-h-screen">
      <LandingView onStart={handleStart} user={user} />
    </div>
  );
}
