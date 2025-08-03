'use client';

import {
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentMethodPage() {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // 🔧 Added loading state

  useEffect(() => {
    const fetchSetupIntent = async () => {
      try {
        const res = await fetch('/api/create-setup-intent', {
          method: 'POST',
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to create setup intent');

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false); // 🔧 Set loading to false once request completes
      }
    };

    fetchSetupIntent();
  }, []);

  return (
    <>
      <Head>
        <title>Ilyzlist - Add Payment Method</title>
      </Head>

      <div className="min-h-screen bg-white p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-[#3742D1] mb-6 text-center">
          Add a Payment Method
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {loading && (
          <div className="text-center text-gray-600">Loading Stripe...</div>
        )}

        {!loading && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm />
          </Elements>
        )}
      </div>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button 
          onClick={() => router.push('/')} 
          className="p-2 flex flex-col items-center"
          disabled={loading}
        >
          <HomeIcon className="text-white" />
          <span className="text-white text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => router.push('/upload')} 
          className="p-2 flex flex-col items-center"
          disabled={loading}
        >
          <UploadIcon className="text-white" />
          <span className="text-white text-xs mt-1">Upload</span>
        </button>
        <button 
          onClick={() => router.push('/account')} 
          className="p-2 flex flex-col items-center"
          disabled={loading}
        >
          <PaymentIcon className="text-white" />
          <span className="text-white text-xs mt-1">Account</span>
        </button>
      </nav>
    </>
  );
}

