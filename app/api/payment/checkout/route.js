// app/api/payment/checkout/route.js
import { createCheckoutSession } from '@/utils/stripe';
import { supabase } from '@/utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { userId, plan } = await req.json();
  
  try {
    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !profile) throw error || new Error('Profile not found');

    // Select correct priceId using NEXT_PUBLIC vars
    const priceId = plan === 'basic'
      ? process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID;

    // Create checkout session with metadata
    const session = await createCheckoutSession(
      profile.stripe_customer_id,
      priceId,
      { userId, planId: plan } // 👈 Pass metadata
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
