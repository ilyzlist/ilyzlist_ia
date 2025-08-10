'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MdSearch, MdNotifications, MdSettings } from 'react-icons/md';
import { FaArrowLeft, FaCheck, FaHome, FaUpload, FaUser } from 'react-icons/fa';

export default function PlansPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState('EUR'); // default

  const supabase = createClientComponentClient();

  // --- Currency helpers ---
  const SUPPORTED = ['EUR', 'USD', 'CAD'];
  const PRICE_TABLE = {
    free:    { EUR: 0,     USD: 0,     CAD: 0     },
    basic:   { EUR: 4.99,  USD: 5.99,  CAD: 7.99  },
    premium: { EUR: 9.99,  USD: 11.99, CAD: 15.99 },
  };

  const detectDefaultCurrency = () => {
    if (typeof navigator !== 'undefined') {
      const lang = (navigator.language || 'en-US').toLowerCase();
      if (lang.includes('fr')) return 'EUR';
      if (lang.includes('ca')) return 'CAD';
    }
    return 'USD';
  };

  const formatMoney = (amount, cur) => {
    const code = cur || 'EUR';
    try {
      return new Intl.NumberFormat('en', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(amount);
    } catch {
      const sym = code === 'EUR' ? '€' : code === 'USD' ? '$' : 'CA$';
      return `${sym}${amount.toFixed(2)}`;
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setCurrency(detectDefaultCurrency());
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          if (isMounted) router.push('/login');
          return;
        }
        if (isMounted) setUser(session.user);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_plan')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile && isMounted) {
          setCurrentPlan(profile.current_plan || 'free');
          setSelectedPlan(profile.current_plan || 'free');
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        if (isMounted) setError('Failed to load user data. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && isMounted) router.push('/login');
    });

    return () => { authListener?.unsubscribe?.(); };
  }, [router, supabase, isMounted]);

  const handleSubscribe = async (planId) => {
    if (!user || !planId || planId === currentPlan || !isMounted) return;

    setError(null);
    try {
      const priceId = planId === 'basic'
        ? process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID;

      if (!priceId) throw new Error('Price ID not configured for selected plan');

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          priceId,
          planId,
          currency, // 👈 force EUR/USD/CAD on Checkout
        }),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const session = await res.json();

      if (session.error) throw new Error(session.error);
      if (session.url) window.location.href = session.url;
      else throw new Error('Failed to create checkout session');
    } catch (err) {
      console.error('Subscription error:', err);
      if (isMounted) setError(err.message || 'Failed to initiate subscription');
    }
  };

  const plans = [
    { name: 'Freemium', id: 'free', features: ['1 drawing analysis per month','Basic insights','Limited history'] },
    { name: 'Basic',    id: 'basic', features: ['15 analyses per month','Advanced insights','Full history access','PDF exports'] },
    { name: 'Premium',  id: 'premium', features: ['25 analyses per month','Premium insights','Trend analytics','Priority support'] },
  ];

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3742D1]"></div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16 relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100" aria-label="Go back">
          <FaArrowLeft className="text-[#3742D1] text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-[#3742D1]">Choose Your Plan</h1>
        <div className="flex gap-4">
          <button className="p-2" aria-label="Search"><MdSearch className="text-[#3742D1] text-xl" /></button>
          <button className="p-2" aria-label="Notifications"><MdNotifications className="text-[#3742D1] text-xl" /></button>
          <button className="p-2" aria-label="Settings"><MdSettings className="text-[#3742D1] text-xl" /></button>
        </div>
      </header>

      {/* Currency Toggle */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Currency</span>
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-full">
            {SUPPORTED.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  currency === c ? 'bg-white shadow font-semibold text-[#3742D1]' : 'text-gray-700'
                }`}
                aria-pressed={currency === c}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          All prices are tax-inclusive; VAT/GST included where required.
        </p>
      </div>

      <div className="space-y-6">
        {plans.map((plan) => {
          const amount = PRICE_TABLE[plan.id]?.[currency] ?? 0;
          const priceLabel = plan.id === 'free' ? 'Free' : `${formatMoney(amount, currency)}/month`;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === plan.id ? 'border-[#3742D1] bg-[#ECF1FF]' : 'border-gray-200 hover:border-[#3742D1]'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(plan.id)}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-[#3742D1]">{plan.name}</h2>
                <p className="text-lg font-semibold">{priceLabel}</p>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaCheck className="text-[#3742D1] mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentPlan !== plan.id && plan.id !== 'free') handleSubscribe(plan.id);
                }}
                className={`w-full mt-4 py-3 rounded-full font-medium ${
                  currentPlan === plan.id || plan.id === 'free'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#3742D1] text-white hover:bg-[#2d39aa]'
                }`}
                disabled={currentPlan === plan.id || plan.id === 'free'}
                aria-label={`Choose ${plan.name} plan`}
              >
                {currentPlan === plan.id || plan.id === 'free' ? 'Current Plan' : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-3 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-white" aria-label="Home">
          <FaHome className="text-xl" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => router.push('/drawings/upload')} className="flex flex-col items-center text-white" aria-label="Upload">
          <FaUpload className="text-xl" />
          <span className="text-xs mt-1">Upload</span>
        </button>
        <button onClick={() => router.push('/account')} className="flex flex-col items-center text-white" aria-label="Account">
          <FaUser className="text-xl" />
          <span className="text-xs mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}
