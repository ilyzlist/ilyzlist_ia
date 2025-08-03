'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabaseClient';

export default function SubscriptionPlan({ user }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      const priceId = plan === 'basic'
        ? process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID;

      const {
        data: { user: currentUser },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !currentUser) throw new Error('User not authenticated');

      const response = await fetch('/api/stripe/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: currentUser.id }),
      });

      const result = await response.json();

      if (!result.id) throw new Error('Stripe session ID not returned');

      window.location.href = `https://checkout.stripe.com/pay/${result.id}`;
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border p-4 rounded-lg">
        <h3 className="font-bold">Basic Plan</h3>
        <p>10 analyses per month</p>
        <p className="text-sm text-gray-600 mt-1">4,99€/mois</p>
        <button
          onClick={() => handleSubscribe('basic')}
          disabled={loading || user.current_plan === 'basic'}
          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {user.current_plan === 'basic' ? 'Current Plan' : 'Subscribe'}
        </button>
      </div>

      <div className="border p-4 rounded-lg">
        <h3 className="font-bold">Premium Plan</h3>
        <p>25 analyses + full reports</p>
        <p className="text-sm text-gray-600 mt-1">9,99€/mois</p>
        <button
          onClick={() => handleSubscribe('premium')}
          disabled={loading || user.current_plan === 'premium'}
          className="mt-3 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
        >
          {user.current_plan === 'premium' ? 'Current Plan' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
}
