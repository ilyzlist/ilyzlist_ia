// app/page.js
"use client";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-[#E2EAFF]/66">
      <Head>
        <title>Ilyzlist - Home</title>
      </Head>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold text-[#3742D1] mb-6">Dashboard</h1>
        
        {/* Your original content here */}
        <div className="bg-white rounded-[30px] p-6 shadow-sm">
          <p className="text-gray-700">
            Welcome back to your parenting dashboard
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <Link 
          href="/" 
          className={`p-2 flex flex-col items-center ${activeTab === 'home' ? 'text-white' : 'text-[#A3B8FF]'}`}
          onClick={() => setActiveTab('home')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          href="/drawings" 
          className={`p-2 flex flex-col items-center ${activeTab === 'drawings' ? 'text-white' : 'text-[#A3B8FF]'}`}
          onClick={() => setActiveTab('drawings')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs mt-1">Drawings</span>
        </Link>
        
        <Link 
          href="/account" 
          className={`p-2 flex flex-col items-center ${activeTab === 'account' ? 'text-white' : 'text-[#A3B8FF]'}`}
          onClick={() => setActiveTab('account')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
          <span className="text-xs mt-1">Account</span>
        </Link>
      </nav>
    </div>
  );
}
