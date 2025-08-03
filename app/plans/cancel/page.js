'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js'; // ✅ Import added
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

export default function CancelPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ); // ✅ Proper initialization
  const router = useRouter();

  useEffect(() => {
    // Optional: Add any cancellation tracking or Supabase logic here
  }, [supabase]);

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-1">
          <ArrowBackIcon className="text-[#3742D1]" />
        </button>
        <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
          Subscription Cancelled
        </h1>
      </header>

      <div className="text-center mt-12">
        <CancelIcon className="text-red-500 text-5xl mb-4" />
        <p className="text-red-500 font-league-spartan text-lg">
          You cancelled your payment. No changes were made.
        </p>

        <button
          onClick={() => router.push('/plans')}
          className="mt-6 px-6 py-3 rounded-full bg-[#3742D1] text-white font-league-spartan"
        >
          Return to Plans
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
