"use client";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js"; // ✅ Added import

export default function Monitor() {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ); // ✅ Proper initialization

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Monitor Progress & Insights
      </h1>
      <p className="text-lg text-gray-700 text-center mb-8">
        Get reports, trends, and professional recommendations tailored to your
        child's emotional and cognitive journey.
      </p>
      <div className="flex space-x-4">
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Get Started
        </Link>
        <Link
          href="/dashboard"
          className="text-blue-600 px-6 py-2 rounded-lg border border-blue-600"
        >
          Skip
        </Link>
      </div>
    </div>
  );
}
