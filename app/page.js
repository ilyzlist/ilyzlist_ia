'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import HomeScreen from '@/components/HomeScreen';
import WelcomeScreen from '@/components/WelcomeScreen';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session === undefined) return; // session is still loading

    if (session) {
      setLoading(false);
    } else {
      router.push('/login');
    }
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return session ? <HomeScreen /> : null;
}
