import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createClient(cookieStore) {
  return createServerComponentClient({ cookies: () => cookieStore });
}
