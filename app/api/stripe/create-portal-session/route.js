import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, returnUrl } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400, headers: { 'content-type': 'application/json' },
      });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !profile?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No Stripe customer found' }), {
        status: 400, headers: { 'content-type': 'application/json' },
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl || new URL('/account', req.url).toString(),
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('[create-portal-session] Error:', e);
    return new Response(JSON.stringify({ error: 'Portal creation failed' }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }
}
