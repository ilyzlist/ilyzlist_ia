// app/payment-success/page.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function Page({ searchParams }) {
  const sessionId = searchParams?.session_id;
  const userId = searchParams?.user_id;

  if (!sessionId || !userId) {
    redirect('/plans?error=missing_params');
  }

  try {
    // 1. Verify Stripe session and get subscription
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    // 2. Determine plan details
    const planDetails = {
      'basic': { analyses: 15, name: 'Basic' },
      'premium': { analyses: 25, name: 'Premium' }
    }[session.metadata?.planId] || { analyses: 1, name: 'Free' };

    // 3. Update profile with ALL fields
    const { error } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: session.customer,
        current_plan: session.metadata?.planId || 'free',
        analysis_limit: planDetails.analyses,
        plan_updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    // 4. Show success UI
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h1 className="text-2xl font-bold text-green-600 mt-4">
            Payment Successful!
          </h1>
          <p className="mt-2">You're now subscribed to {planDetails.name} Plan</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h2 className="font-semibold mb-2">Order Details</h2>
          <p>Plan: {planDetails.name}</p>
          <p>Analyses: {planDetails.analyses}/month</p>
          <p className="mt-2 text-sm text-gray-500">
            Session: {sessionId.slice(0, 8)}...
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="/account"
            className="bg-[#3742D1] hover:bg-[#2d39aa] text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Go to Your Account
          </a>
          <a
            href="/upload"
            className="border border-[#3742D1] text-[#3742D1] px-6 py-3 rounded-full font-medium transition-colors"
          >
            Upload Your First Drawing
          </a>
        </div>
      </div>
    );

   } catch (error) {
    console.error('Update failed:', error);
    redirect(`/plans?error=update_failed`);
  }
}
