// utils/supabase/server.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side usage.
 * If no cookieStore is provided, it defaults to next/headers cookies.
 */
export function createClient(cookieStore = cookies()) {
  return createServerComponentClient({ cookies: () => cookieStore });
}
