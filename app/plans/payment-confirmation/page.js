'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from "@/utils/supabaseClient";
import Link from 'next/link';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const confirmPayment = async () => {
      const successParam = searchParams.get('success');
      const cancelledParam = searchParams.get('canceled');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        router.push('/login');
        return;
      }

      if (successParam === 'true') {
        setSuccess(true);
      } else if (cancelledParam === 'true') {
        setSuccess(false);
      }

      setLoading(false);
    };

    confirmPayment();
  }, [router, searchParams]);

  if (loading) {
    return <div className="text-center mt-10 text-[#3742D1]">Verifying payment...</div>;
  }

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/plans')} className="p-1">
          <ArrowBackIcon className="text-[#3742D1]" />
        </button>
        <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
          {success ? 'Subscription Confirmed' : 'Subscription Cancelled'}
        </h1>
      </header>

      <div className="text-center mt-12">
        {success ? (
          <>
            <CheckCircleIcon className="text-green-500 text-5xl mb-4" />
            <p className="text-[#3742D1] font-league-spartan text-lg">
              Your subscription has been successfully activated.
            </p>
          </>
        ) : (
          <>
            <CancelIcon className="text-red-500 text-5xl mb-4" />
            <p className="text-red-500 font-league-spartan text-lg">
              Payment was cancelled or failed. You can try again.
            </p>
          </>
        )}

        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-3 rounded-full bg-[#3742D1] text-white font-league-spartan"
        >
          Go to Dashboard
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button
          onClick={() => router.push("/")}
          className="p-2 flex flex-col items-center"
        >
          <HomeIcon className="text-white" />
          <span className="text-white text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => router.push("/drawings/upload")}
          className="p-2 flex flex-col items-center"
        >
          <UploadIcon className="text-white" />
          <span className="text-white text-xs mt-1">Upload</span>
        </button>
        <button
          onClick={() => router.push("/account")}
          className="p-2 flex flex-col items-center"
        >
          <AccountCircleIcon className="text-white" />
          <span className="text-white text-xs mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}
