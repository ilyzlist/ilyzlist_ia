"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js"; // ✅ Added import
import { supabase } from "@/utils/supabaseClient"; // ❓ Remove if unused
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Logout() {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ); // ✅ Properly initialized client
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        const { error } = await supabaseClient.auth.signOut();
        if (!error) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    logout();
  }, [router]);

  return <LoadingSpinner />;
}
