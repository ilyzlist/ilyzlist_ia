// app/api/create-checkout-session/route.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Resolve your site origin (prod on Vercel, or local)
function getOrigin(req) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (site) return site;
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (base) return base;

  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  return `${proto}://${host}`;
}

export async function POST(req) {
  try {
    const { userId, email, priceId, planId } = await req.json();

    if (!userId || !email || !priceId || !planId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const origin = getOrigin(req);
    const successUrl = `${origin}/plans/payment-confirmation?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/plans/payment-confirmation?canceled=true`;

    // Get or create Stripe customer
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('[create-checkout-session] Supabase profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile lookup failed' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    // Use a different var name to avoid any redeclaration conflicts
    let resolvedCustomerId = profileData?.stripe_customer_id ?? null;

    if (!resolvedCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      resolvedCustomerId = customer.id;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: resolvedCustomerId })
        .eq('id', userId);

      if (updateErr) {
        console.error('[create-checkout-session] Failed to store customer id:', updateErr);
        // Not fatal for checkout creation; continue
      }
    }

    // Create Checkout Session (subscription)
    const session = await stripe.checkout.sessions.create({
      customer: resolvedCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, planId },
      subscription_data: {
        metadata: { userId, planId },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    console.error('[create-checkout-session] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
