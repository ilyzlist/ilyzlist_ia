// app/signup/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { FcGoogle } from "react-icons/fc";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({ form: false, google: false });
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, form: true });
    setError("");

    try {
      // Email/password signup
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        }
      });

      if (authError) throw authError;

      // Create Stripe customer
      const res = await fetch('/api/create-stripe-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user?.id, email }),
      });

      if (!res.ok) throw new Error('Failed to create Stripe customer');

      const { customerId } = await res.json();

      // Create profile
      await supabase.from('profiles').upsert({
        id: data.user?.id,
        email,
        stripe_customer_id: customerId,
        analysis_quota: 1,
        subscription_plan: 'free',
        current_plan: 'Free Tier',
        analysis_limit: 1
      });

      router.push('/verify-email');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, form: false });
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading({ ...loading, google: true });
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, google: false });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#3742D1] mb-8 text-center">
          Create Account
        </h1>

        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Your existing email/password form fields */}
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading.form}
            className="w-full bg-[#3742D1] text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading.form ? "Creating account..." : "Sign Up"}
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading.google}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <FcGoogle className="text-xl" />
            {loading.google ? "Signing up..." : "Continue with Google"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-[#3742D1] font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}