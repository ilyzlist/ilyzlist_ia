// app/api/webhooks/stripe/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * Next.js App Router notes:
 * - Do NOT export `config.api.bodyParser = false`; that's for Pages Router.
 * - We must read the RAW body via request.text() and pass the string directly to Stripe.
 * - Keep runtime on nodejs so Stripe's crypto works as expected.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Stripe & Supabase clients ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Plan details (keep in sync with your product catalog) ---
const PLAN_DETAILS = {
  basic: { analyses: 15, name: 'Basic' },
  premium: { analyses: 25, name: 'Premium' },
  free: { analyses: 1, name: 'Free' },
};

// --- Helpers ---
const safeTrim = (v) => (typeof v === 'string' ? v.trim() : '');

function getPlanIdFromPrice(priceId) {
  const cleanId = safeTrim(priceId);
  const basicId = safeTrim(process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_PRICE_ID);
  const premiumId = safeTrim(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID);

  if (basicId && cleanId === basicId) return 'basic';
  if (premiumId && cleanId === premiumId) return 'premium';
  return 'free';
}

/**
 * Try verifying with LIVE secret first (if present), then TEST secret (if present).
 * This helps during transition; in steady state your deployed env should have only ONE correct secret.
 */
function verifyStripeSignature(rawBody, signature) {
  const live = safeTrim(process.env.STRIPE_WEBHOOK_SECRET_LIVE);
  const test = safeTrim(process.env.STRIPE_WEBHOOK_SECRET_TEST);
  const single = safeTrim(process.env.STRIPE_WEBHOOK_SECRET); // fallback if you use a single var

  const tried = [];

  if (live) {
    try {
      const e = stripe.webhooks.constructEvent(rawBody, signature, live);
      return { event: e, secretUsed: 'LIVE' };
    } catch (err) {
      tried.push(`LIVE(${err.message})`);
    }
  }

  if (test) {
    try {
      const e = stripe.webhooks.constructEvent(rawBody, signature, test);
      return { event: e, secretUsed: 'TEST' };
    } catch (err) {
      tried.push(`TEST(${err.message})`);
    }
  }

  if (single) {
    try {
      const e = stripe.webhooks.constructEvent(rawBody, signature, single);
      return { event: e, secretUsed: 'SINGLE' };
    } catch (err) {
      tried.push(`SINGLE(${err.message})`);
    }
  }

  const message = `No signatures matched. Tried: ${tried.join(' | ')}`;
  throw new Error(message);
}

// --- Handlers ---
export async function POST(request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let rawBody;
  try {
    // IMPORTANT: use the exact raw string body
    rawBody = await request.text();
  } catch (err) {
    console.error('[WEBHOOK] Failed to read raw body:', err);
    return NextResponse.json({ error: 'Unable to read request body' }, { status: 400 });
  }

  let event;
  let usedSecret = '';
  try {
    const result = verifyStripeSignature(rawBody, signature);
    event = result.event;
    usedSecret = result.secretUsed;
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[WEBHOOK] OK • type=${event.type} • livemode=${event.livemode} • secret=${usedSecret}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSession(event.data.object);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.resumed':
      case 'customer.subscription.paused':
      case 'invoice.payment_succeeded': {
        // invoice.payment_succeeded covers renewals as well
        await handleSubscriptionChange(event.data.object);
        break;
      }
      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error('[WEBHOOK] Handler error:', err);
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSession(session) {
  console.log('[WEBHOOK] checkout.session.completed', {
    id: session.id,
    customer: session.customer,
    subscription: session.subscription,
    metadata: session.metadata,
  });

  if (!session.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  await updateUserProfile(subscription, session.metadata?.userId);
}

async function handleSubscriptionChange(obj) {
  // obj can be a Subscription or an Invoice (on renewals)
  let subscription;

  if (obj.object === 'subscription') {
    subscription = obj;
  } else if (obj.object === 'invoice' && obj.subscription) {
    subscription = await stripe.subscriptions.retrieve(obj.subscription);
  } else {
    console.log('[WEBHOOK] Unsupported object for subscription change:', obj.object);
    return;
  }

  console.log('[WEBHOOK] subscription change', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    metadata: subscription.metadata,
  });

  await updateUserProfile(subscription, subscription.metadata?.userId);
}

async function updateUserProfile(subscription, explicitUserId) {
  const firstItem = subscription.items?.data?.[0];
  const priceId = firstItem?.price?.id;
  const planId = getPlanIdFromPrice(priceId);
  const planDetails = PLAN_DETAILS[planId] || PLAN_DETAILS.free;

  // Resolve userId: prefer metadata.userId, else look up by stripe_customer_id
  let userId = safeTrim(explicitUserId);
  if (!userId) {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .maybeSingle();

    if (profileErr) {
      console.error('[WEBHOOK] Supabase error fetching profile by customer:', profileErr);
    }
    userId = profile?.id || '';
  }

  if (!userId) {
    console.warn(
      `[WEBHOOK] No userId found for customer=${subscription.customer}. ` +
        `Ensure you store stripe_customer_id in profiles at checkout creation.`
    );
    return;
  }

  console.log(`[WEBHOOK] Updating user ${userId} → plan=${planId} (price=${priceId})`);

  const profileUpdate = {
    subscription_plan: planId,
    current_plan: planId,
    analysis_limit: planDetails.analyses,
    analysis_quota: planDetails.analyses,
    plan_updated_at: new Date().toISOString(),
  };

  const { error: profErr } = await supabase.from('profiles').update(profileUpdate).eq('id', userId);
  if (profErr) {
    console.error('[WEBHOOK] Supabase error updating profiles:', profErr, profileUpdate);
    throw profErr;
  }

  const subscriptionRow = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId || null,
    status: subscription.status,
    plan_type: planId,
    analyses_remaining: planDetails.analyses,
    renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: subErr } = await supabase.from('subscriptions').upsert(subscriptionRow);
  if (subErr) {
    console.error('[WEBHOOK] Supabase error upserting subscriptions:', subErr, subscriptionRow);
    throw subErr;
  }

  console.log('[WEBHOOK] Profile + subscription updated successfully.');
}
