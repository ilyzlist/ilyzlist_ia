"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js"; // ✅ Import added

export default function Analyze() {
  // ✅ Initialize Supabase client (won’t break build)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Analyze & Understand
      </h1>
      <p className="text-lg text-gray-700 text-center mb-8">
        Simply upload a drawing, and our AI will analyze patterns, colors, and
        strokes to provide insights into your child’s emotions over time.
      </p>
      <div className="flex space-x-4">
        <Link
          href="/monitor"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Next
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
