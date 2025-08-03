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

  // Use the auth helpers client
  const supabase = createClientComponentClient();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          if (isMounted) router.push('/login');
          return;
        }

        if (isMounted) setUser(session.user);

        // Get user profile
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

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && isMounted) {
        router.push('/login');
      }
    });

    return () => {
      if (authListener?.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, [router, supabase, isMounted]);

  const handleSubscribe = async (planId) => {
    if (!user || !planId || planId === currentPlan || !isMounted) return;

    setError(null);
    
    try {
      const priceId = planId === 'basic'
        ? process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID;

      if (!priceId) throw new Error('Price ID not configured for selected plan');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          email: user.email,
          priceId,
          planId,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/plans`
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const session = await response.json();

      if (session.error) throw new Error(session.error);
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      if (isMounted) setError(error.message || 'Failed to initiate subscription');
    }
  };

  const plans = [
    {
      name: 'Freemium',
      id: 'free',
      price: '0€',
      features: [
        '1 drawing analysis per month',
        'Basic insights',
        'Limited history'
      ],
    },
    {
      name: 'Basic',
      id: 'basic',
      price: '4.99€/month',
      features: [
        '15 analyses per month',
        'Advanced insights',
        'Full history access',
        'PDF exports'
      ],
    },
    {
      name: 'Premium',
      id: 'premium',
      price: '9.99€/month',
      features: [
        '25 analyses per month',
        'Premium insights',
        'Trend analytics',
        'Priority support'
      ],
    }
  ];

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3742D1]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16 relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-[#3742D1] text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-[#3742D1]">Choose Your Plan</h1>
        <div className="flex gap-4">
          <button className="p-2" aria-label="Search">
            <MdSearch className="text-[#3742D1] text-xl" />
          </button>
          <button className="p-2" aria-label="Notifications">
            <MdNotifications className="text-[#3742D1] text-xl" />
          </button>
          <button className="p-2" aria-label="Settings">
            <MdSettings className="text-[#3742D1] text-xl" />
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'border-[#3742D1] bg-[#ECF1FF]'
                : 'border-gray-200 hover:border-[#3742D1]'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(plan.id)}
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-[#3742D1]">{plan.name}</h2>
              <p className="text-lg font-semibold">{plan.price}</p>
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
                if (currentPlan !== plan.id) handleSubscribe(plan.id);
              }}
              className={`w-full mt-4 py-3 rounded-full font-medium ${
                currentPlan === plan.id
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-[#3742D1] text-white hover:bg-[#2d39aa]'
              }`}
              disabled={currentPlan === plan.id}
              aria-label={`Choose ${plan.name} plan`}
            >
              {currentPlan === plan.id ? 'Current Plan' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-3 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl">
        <button 
          onClick={() => router.push('/')} 
          className="flex flex-col items-center text-white"
          aria-label="Home"
        >
          <FaHome className="text-xl" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => router.push('/drawings/upload')} 
          className="flex flex-col items-center text-white"
          aria-label="Upload"
        >
          <FaUpload className="text-xl" />
          <span className="text-xs mt-1">Upload</span>
        </button>
        <button 
          onClick={() => router.push('/account')} 
          className="flex flex-col items-center text-white"
          aria-label="Account"
        >
          <FaUser className="text-xl" />
          <span className="text-xs mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}