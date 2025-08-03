'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import {
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon
} from '@mui/icons-material';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  const handleUploadDrawing = () => {
    router.push('/drawings/upload');
  };

  return (
    <>
      <Head>
        <title>Ilyzlist - Privacy Policy</title>
      </Head>

      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-1">
              <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
              Privacy Policy
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2"
              aria-label="Search"
            >
              <SearchIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <button className="p-2" aria-label="Notifications">
              <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
          </div>
        </header>

        {/* Search Bar */}
        {showSearch && (
          <div className="search-bar mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-[#3742D1]" />
              </div>
              <input
                type="text"
                placeholder="Search privacy policy..."
                className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
              />
            </div>
          </div>
        )}

        {/* Privacy Policy Content */}
        <div className="prose max-w-none text-black font-league-spartan">
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-sm mb-4">
              At Ilyzlist, we are committed to protecting your privacy and the privacy of your children. 
              This Privacy Policy explains how we collect, use, and safeguard information in our AI-powered 
              drawing analysis application.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 text-sm mb-4 space-y-1">
              <li>Child profiles (name, age, birth date)</li>
              <li>Drawings uploaded for analysis</li>
              <li>AI-generated analysis results</li>
              <li>Account information (email address, payment details for premium features)</li>
              <li>Usage data (app interactions, feature usage)</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">3. How We Use Information</h2>
            <ul className="list-disc pl-5 text-sm mb-4 space-y-1">
              <li>Provide personalized drawing analysis</li>
              <li>Improve AI models</li>
              <li>Deliver app functionality</li>
              <li>Communicate updates</li>
              <li>Ensure security</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">4. Data Protection</h2>
            <ul className="list-disc pl-5 text-sm mb-4 space-y-1">
              <li>Encryption of data</li>
              <li>Secure storage with access controls</li>
              <li>Regular security audits</li>
              <li>Compliance with COPPA</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
            <ul className="list-disc pl-5 text-sm mb-4 space-y-1">
              <li>Cloud storage (Supabase)</li>
              <li>AI model processing</li>
              <li>Analytics (anonymous usage data)</li>
              <li>Payment processing (Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
            <p className="text-sm">
              Email: privacy@ilyzlist.com
              <br />
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button onClick={() => router.push("/")} className="p-2 flex flex-col items-center">
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Home</span>
        </button>
        <button onClick={handleUploadDrawing} className="p-2 flex flex-col items-center">
          <UploadIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Upload</span>
        </button>
        <button onClick={() => router.push("/account")} className="p-2 flex flex-col items-center">
          <AccountCircleIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Account</span>
        </button>
      </nav>

      <style jsx global>{`
        @font-face {
          font-family: "League Spartan";
          src:
            url("/fonts/league-spartan.woff2") format("woff2"),
            url("/fonts/league-spartan.woff") format("woff");
          font-weight: 400;
          font-style: normal;
        }

        .font-league-spartan {
          font-family: "League Spartan", sans-serif;
        }
      `}</style>
    </>
  );
}
