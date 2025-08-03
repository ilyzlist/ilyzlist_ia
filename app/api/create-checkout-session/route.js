// app/api/create-checkout-session/route.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, email, priceId, planId } = await req.json();

    if (!userId || !email || !priceId || !planId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/plans/payment-confirmation?success=true`;
    const cancelUrl = `${baseUrl}/plans/payment-confirmation?canceled=true`;

    // Get or create Stripe customer
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    let customerId = profileData?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, planId }, // 👈 send metadata
      subscription_data: {
        metadata: { userId, planId } // 👈 also attach to subscription
      }
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { status: 500 }
    );
  }
}
