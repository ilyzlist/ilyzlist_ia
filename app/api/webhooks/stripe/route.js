import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // 👈 Essentiel pour vérif signature Stripe
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plan details
const PLAN_DETAILS = {
  basic: { analyses: 15, name: 'Basic' },
  premium: { analyses: 25, name: 'Premium' },
  free: { analyses: 1, name: 'Free' },
};

export async function POST(request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing Stripe signature or webhook secret' },
      { status: 400 }
    );
  }

  let event;
  const rawBody = await request.text(); // 👈 Important pour Stripe

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[WEBHOOK] Event type: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutSession(event.data.object);
  }

  if (['customer.subscription.created', 'customer.subscription.updated'].includes(event.type)) {
    await handleSubscriptionChange(event.data.object);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSession(session) {
  console.log('[WEBHOOK] Checkout session:', session.id, 'metadata:', session.metadata);
  if (!session.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  await updateUserProfile(subscription, session.metadata?.userId);
}

async function handleSubscriptionChange(subscription) {
  console.log('[WEBHOOK] Subscription update:', subscription.id, 'metadata:', subscription.metadata);
  await updateUserProfile(subscription, subscription.metadata?.userId);
}

async function updateUserProfile(subscription, userId) {
  const priceId = subscription.items.data[0].price.id;

  console.log('[WEBHOOK DEBUG] priceId from Stripe:', priceId);
  console.log('[WEBHOOK DEBUG] basic plan env:', process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_PRICE_ID);
  console.log('[WEBHOOK DEBUG] premium plan env:', process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID);

  const planId = getPlanIdFromPrice(priceId);
  const planDetails = PLAN_DETAILS[planId] || PLAN_DETAILS.free;

  if (!userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();
    userId = profile?.id;
  }

  console.log(`[WEBHOOK] Updating user ${userId} to plan ${planId}`);

  await supabase
    .from('profiles')
    .update({
      subscription_plan: planId,
      current_plan: planId,
      analysis_limit: planDetails.analyses,
      analysis_quota: planDetails.analyses,
      plan_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status,
      plan_type: planId,
      analyses_remaining: planDetails.analyses,
      renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

  console.log('[WEBHOOK] Profile and subscription updated successfully.');
}

function getPlanIdFromPrice(priceId) {
  const cleanId = priceId.trim();
  if (cleanId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_PRICE_ID.trim()) return 'basic';
  if (cleanId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID.trim()) return 'premium';
  return 'free';
}
