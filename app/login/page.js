'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    page: true,
    login: false,
    google: false
  });
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, page: true }));
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError.message);
        throw sessionError;
      }

      // Prevent redirect loop: only redirect if not already on home page
      if (session && window.location.pathname !== '/') {
        router.replace('/');
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkSession();
    }

    // Prefetch the home page for faster navigation after login
    router.prefetch('/');
  }, [checkSession, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(prev => ({ ...prev, login: true }));
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      router.replace('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(prev => ({ ...prev, login: false }));
    }
  };

  const handleGoogleLogin = async () => {
    if (typeof window === 'undefined') return;
    
    setLoading(prev => ({ ...prev, google: true }));
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (authError) throw authError;
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, google: false }));
    }
  };

  if (loading.page) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Ilyzlist - Login</title>
        <meta name="description" content="Login to your Ilyzlist account" />
      </Head>

      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/ilyzlist_logo.webp"
              alt="Ilyzlist Logo"
              width={180}
              height={60}
              priority
              className="h-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/ilyzlist_logo.png";
              }}
            />
          </div>

          <h1 className="text-2xl font-bold text-[#3742D1] mb-8 text-center">
            Welcome Back
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3742D1] focus:border-transparent"
                required
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3742D1] focus:border-transparent"
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <Link
                href="/forgot-password"
                className="text-sm text-[#3742D1] float-right mt-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading.login}
              className={`w-full bg-[#3742D1] text-white py-3 rounded-lg font-medium transition-colors ${
                loading.login ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2a35c0]'
              }`}
            >
              {loading.login ? 'Logging in...' : 'Login'}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading.google}
              className={`w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors ${
                loading.google ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#3742D1] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}