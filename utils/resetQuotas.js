// utils/resetQuotas.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function resetMonthlyQuotas() {
  try {
    // Reset free tier users to 1 analysis
    await supabase
      .from('profiles')
      .update({ analysis_quota: 1 })
      .eq('subscription_plan', 'free');

    // Reset basic tier to 10 analyses
    await supabase
      .from('profiles')
      .update({ analysis_quota: 10 })
      .eq('subscription_plan', 'basic');

    // Premium tier remains unlimited (handled in API)
    
    console.log('Monthly quotas reset successfully');
    return true;
  } catch (error) {
    console.error('Failed to reset quotas:', error);
    return false;
  }
}