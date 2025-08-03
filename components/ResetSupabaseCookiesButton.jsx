'use client';
import { useState } from 'react';

export default function ResetSupabaseCookiesButton() {
  const [done, setDone] = useState(false);

  const handleReset = () => {
    document.cookie.split(";").forEach(c => {
      const name = c.split("=")[0].trim();
      if (name.includes("supabase") || name.startsWith("sb-")) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    });
    setDone(true);
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        🧼 Reset Supabase Cookies
      </button>
      {done && (
        <p className="text-green-600 text-sm mt-2">
          ✅ Supabase cookies cleared. Please refresh the page.
        </p>
      )}
    </div>
  );
}
