'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Head from 'next/head';
import {
  MdHome, MdUpload, MdAccountCircle, MdEdit, MdPerson, MdPayment,
  MdPrivacyTip, MdHelp, MdLogout, MdArrowBack, MdSearch, MdSettings, MdChildCare
} from 'react-icons/md';
import LoadingSpinner from '@/components/LoadingSpinner';

const planLabel = (p) => {
  if (p === 'basic') return 'Basic Plan';
  if (p === 'premium') return 'Premium Plan';
  return 'Free Plan';
};
const accountLabel = (p) => {
  if (p === 'basic') return 'Basic Account';
  if (p === 'premium') return 'Premium Account';
  return 'Free Account';
};

export default function AccountScreen() {
  const router = useRouter();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // profile state
  const [currentPlan, setCurrentPlan] = useState('free');
  const [stripeCustomerId, setStripeCustomerId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push('/login');
          return;
        }
        setUser(user);
        setEmail(user.email || '');
        setTempEmail(user.email || '');

        // load profile (plan + customer id)
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('current_plan, stripe_customer_id')
          .eq('id', user.id)
          .single();

        if (!pErr && profile) {
          setCurrentPlan(profile.current_plan || 'free');
          setStripeCustomerId(profile.stripe_customer_id || null);
        }
      } catch (e) {
        console.error('Error loading account:', e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleEditEmail = () => {
    if (isEditingEmail) {
      setEmail(tempEmail);
      // TODO: supabase.auth.updateUser({ email: tempEmail });
    }
    setIsEditingEmail(!isEditingEmail);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleUploadDrawing = () => router.push('/drawings/upload');

  const navigateToChildrenProfiles = () => router.push('/children-profiles');

  const handleSubscriptionClick = async () => {
    // Free → go to plans (upgrade)
    if (currentPlan === 'free' || !stripeCustomerId) {
      router.push('/plans');
      return;
    }
    // Paid → open Stripe customer portal
    try {
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          returnUrl: `${window.location.origin}/account`,
        }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        // Fallback to plans if portal fails
        router.push('/plans');
      }
    } catch (e) {
      console.error('Portal error:', e);
      router.push('/plans');
    }
  };

  if (loading || isLoggingOut) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
      <Head><title>Ilyzlist - Account</title></Head>

      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1">
            <MdArrowBack className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1]">Account</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowSearch((s) => !s)} className="p-2" aria-label="Search">
            <MdSearch className="w-5 h-5 text-[#3742D1]" />
          </button>
          <button onClick={() => router.push('/settings')} className="p-2" aria-label="Settings">
            <MdSettings className="w-5 h-5 text-[#3742D1]" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-6">
          <input type="text" placeholder="Search account..." className="w-full p-3 bg-[#ECF1FF] rounded-lg" />
        </div>
      )}

      {/* Profile */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#3742D1] flex items-center justify-center text-white text-2xl">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.email}</h2>
            <p className="text-sm text-gray-500">{accountLabel(currentPlan)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Children Profiles */}
          <button
            onClick={navigateToChildrenProfiles}
            className="w-full flex justify-between items-center p-3 border-b border-[#ECF1FF] hover:bg-[#ECF1FF]"
          >
            <div className="flex items-center gap-3">
              <MdChildCare className="text-[#3742D1]" />
              <span>Children Profiles</span>
            </div>
            <span className="text-sm text-gray-500">Manage children</span>
          </button>

          {/* Email */}
          <div className="flex justify-between items-center p-3 border-b border-[#ECF1FF]">
            <div className="flex items-center gap-3">
              <MdPerson className="text-[#3742D1]" />
              <span>Email Address</span>
            </div>
            {isEditingEmail ? (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="border-b border-[#3742D1] px-1"
                />
                <button onClick={handleEditEmail} className="text-[#3742D1]">Save</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{email}</span>
                <button onClick={handleEditEmail} className="text-[#3742D1]"><MdEdit /></button>
              </div>
            )}
          </div>

          {/* Subscription */}
          <button
            onClick={handleSubscriptionClick}
            className="w-full flex justify-between items-center p-3 border-b border-[#ECF1FF] hover:bg-[#ECF1FF]"
          >
            <div className="flex items-center gap-3">
              <MdPayment className="text-[#3742D1]" />
              <span>Subscription</span>
            </div>
            <span className="text-sm text-gray-500">{planLabel(currentPlan)}</span>
          </button>

          {/* Privacy */}
          <button
            onClick={() => router.push('/privacy-policy')}
            className="w-full flex justify-between items-center p-3 border-b border-[#ECF1FF] hover:bg-[#ECF1FF]"
          >
            <div className="flex items-center gap-3">
              <MdPrivacyTip className="text-[#3742D1]" />
              <span>Privacy</span>
            </div>
          </button>

          {/* Help */}
          <button
            onClick={() => router.push('/help-center')}
            className="w-full flex justify-between items-center p-3 border-b border-[#ECF1FF] hover:bg-[#ECF1FF]"
          >
            <div className="flex items-center gap-3">
              <MdHelp className="text-[#3742D1]" />
              <span>Help & Support</span>
            </div>
          </button>
        </div>
      </section>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 px-4 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg"
      >
        <MdLogout className="text-red-500" />
        <span>Log Out</span>
      </button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button onClick={() => router.push('/')} className="p-2 flex flex-col items-center" aria-label="Home">
          <MdHome className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Home</span>
        </button>
        <button onClick={handleUploadDrawing} className="p-2 flex flex-col items-center" aria-label="Upload">
          <MdUpload className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Upload</span>
        </button>
        <button onClick={() => router.push('/account')} className="p-2 flex flex-col items-center" aria-label="Account">
          <MdAccountCircle className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}
