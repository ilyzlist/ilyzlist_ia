// app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Display allowances only (don't use to compute credits except at cycle reset)
const PLAN_DETAILS = {
  free:    { analyses: 1,  name: 'Free' },
  basic:   { analyses: 15, name: 'Basic' },
  premium: { analyses: 25, name: 'Premium' },
};

// Optional hard fallback for any legacy price ids still live
const PRICE_TO_PLAN = {
  // 'price_OLD123': 'basic',
  // 'price_OLD456': 'premium',
};

const safeTrim = (v) => (typeof v === 'string' ? v.trim() : '');
const isPaidStatus = (s) => s === 'active' || s === 'trialing';

function verifyStripeSignature(rawBody, signature) {
  const live = safeTrim(process.env.STRIPE_WEBHOOK_SECRET_LIVE);
  const test = safeTrim(process.env.STRIPE_WEBHOOK_SECRET_TEST);
  const single = safeTrim(process.env.STRIPE_WEBHOOK_SECRET);

  const tried = [];

  if (live) {
    try { return { event: stripe.webhooks.constructEvent(rawBody, signature, live), secretUsed: 'LIVE' }; }
    catch (err) { tried.push(`LIVE(${err.message})`); }
  }
  if (test) {
    try { return { event: stripe.webhooks.constructEvent(rawBody, signature, test), secretUsed: 'TEST' }; }
    catch (err) { tried.push(`TEST(${err.message})`); }
  }
  if (single) {
    try { return { event: stripe.webhooks.constructEvent(rawBody, signature, single), secretUsed: 'SINGLE' }; }
    catch (err) { tried.push(`SINGLE(${err.message})`); }
  }

  throw new Error(`No signatures matched. Tried: ${tried.join(' | ')}`);
}

// ---------- PLAN RESOLUTION (robust) ----------
async function resolvePlanId(subscription) {
  // 1) Explicit metadata on subscription (from Checkout/session.subscription_data.metadata)
  const metaPlan = safeTrim(subscription?.metadata?.planId);
  if (metaPlan && PLAN_DETAILS[metaPlan]) return metaPlan;

  // 2) Price metadata (set in Stripe Dashboard): plan_id=basic/premium
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  if (priceId) {
    try {
      const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
      const byMeta = safeTrim(price?.metadata?.plan_id);
      if (byMeta && PLAN_DETAILS[byMeta]) return byMeta;

      // 3) lookup_key heuristics
      const lk = String(price.lookup_key || '').toLowerCase();
      if (lk.includes('basic')) return 'basic';
      if (lk.includes('premium')) return 'premium';
    } catch (e) {
      console.warn('[WEBHOOK] Could not retrieve price', priceId, e.message);
    }
    // 4) hard map fallback
    if (PRICE_TO_PLAN[priceId]) return PRICE_TO_PLAN[priceId];
  }

  // 5) unknown → free
  return 'free';
}

// ---------- DB HELPERS ----------
async function findUserIdByCustomer(stripeCustomerId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (error) {
    console.error('[WEBHOOK] Supabase error finding user by customer:', error);
  }
  return data?.id || null;
}

async function writeSubscription(userId, subscription, planId) {
  const priceId = subscription?.items?.data?.[0]?.price?.id || null;

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    plan_type: planId,
    renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    // DO NOT touch analyses_remaining here; handle on cycle reset only.
  });
  if (error) throw error;
}

async function writeProfilePlan(userId, planId) {
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_plan: planId,
      current_plan: planId,
      analysis_limit: PLAN_DETAILS[planId]?.analyses ?? PLAN_DETAILS.free.analyses,
      // DO NOT reset analysis_quota here; handle on cycle reset only.
      plan_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (error) throw error;
}

async function resetMonthlyQuota(userId, planId) {
  const allowance = PLAN_DETAILS[planId]?.analyses ?? PLAN_DETAILS.free.analyses;

  const { error: pErr } = await supabase
    .from('profiles')
    .update({ analysis_quota: allowance })
    .eq('id', userId);
  if (pErr) throw pErr;

  const { error: sErr } = await supabase
    .from('subscriptions')
    .update({ analyses_remaining: allowance, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (sErr) throw sErr;
}

// ---------- EVENT HANDLERS ----------
export async function POST(request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch (err) {
    console.error('[WEBHOOK] Failed to read raw body:', err);
    return NextResponse.json({ error: 'Unable to read request body' }, { status: 400 });
  }

  let event, usedSecret;
  try {
    const res = verifyStripeSignature(rawBody, signature);
    event = res.event;
    usedSecret = res.secretUsed;
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[WEBHOOK] OK • type=${event.type} • livemode=${event.livemode} • secret=${usedSecret}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // Initial purchase
        const session = event.data.object;
        if (!session.subscription) break;
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await applyPlanFromSubscription(sub, session.metadata?.userId);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.resumed':
      case 'customer.subscription.paused': {
        const sub = event.data.object;
        await applyPlanFromSubscription(sub, sub.metadata?.userId);
        break;
      }

      case 'invoice.payment_succeeded': {
        // Reset credits on new cycle (or initial creation)
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        // Only handle subscription cycles
        const reason = invoice.billing_reason; // 'subscription_cycle' OR 'subscription_create' etc.
        if (!['subscription_cycle', 'subscription_create'].includes(reason)) break;

        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        await handleCycleReset(sub);
        break;
      }

      default:
        // ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[WEBHOOK] Handler error:', err);
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
  }
}

async function applyPlanFromSubscription(subscription, explicitUserId) {
  const status = subscription.status;
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  let userId = safeTrim(explicitUserId);

  if (!userId) {
    userId = await findUserIdByCustomer(subscription.customer);
  }
  if (!userId) {
    console.warn('[WEBHOOK] No user found for customer', subscription.customer);
    return;
  }

  // Resolve desired plan (robust)
  const resolvedPlan = await resolvePlanId(subscription);

  // Set plan only to paid plans when status is active/trialing; else free
  const planId = isPaidStatus(status) ? resolvedPlan : 'free';

  // If plan resolution failed but subscription is active, avoid clobbering to free:
  if (isPaidStatus(status) && planId === 'free') {
    // Keep existing plan if it is already a paid plan
    const { data: prof } = await supabase
      .from('profiles')
      .select('current_plan')
      .eq('id', userId)
      .maybeSingle();
    if (prof?.current_plan && prof.current_plan !== 'free') {
      console.warn(`[WEBHOOK] Plan resolution unknown for active sub; preserving existing plan=${prof.current_plan}`);
      await writeSubscription(userId, subscription, prof.current_plan);
      return;
    }
  }

  console.log(`[WEBHOOK] applyPlan user=${userId} status=${status} price=${priceId} -> plan=${planId}`);
  await writeSubscription(userId, subscription, planId);
  await writeProfilePlan(userId, planId);
}

async function handleCycleReset(subscription) {
  const status = subscription.status;
  if (!isPaidStatus(status)) return;

  let userId = await findUserIdByCustomer(subscription.customer);
  if (!userId) return;

  const planId = await resolvePlanId(subscription);
  console.log(`[WEBHOOK] cycle reset for user=${userId} plan=${planId}`);
  await resetMonthlyQuota(userId, planId);
}
