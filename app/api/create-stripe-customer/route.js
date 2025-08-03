import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export async function POST(req) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: userId },
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (err) {
    console.error("Stripe create customer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
