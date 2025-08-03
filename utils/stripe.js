// utils/stripe.js
import Stripe from 'stripe';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

/**
 * Create Stripe Checkout Session with metadata
 * @param {string} customerId - Stripe customer ID
 * @param {string} priceId - Price ID (from env)
 * @param {object} metadata - Extra data to pass to Stripe (userId, planId)
 */
export const createCheckoutSession = async (customerId, priceId, metadata = {}) => {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/plans/payment-confirmation?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/plans/payment-confirmation?canceled=true`,
    metadata, // 👈 Send metadata in session
    subscription_data: {
      metadata // 👈 Also attach to subscription
    }
  });
};
