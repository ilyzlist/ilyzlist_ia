// utils/analysisLimit.js
import { supabase } from '@/utils/supabaseClient';

export const checkAnalysisLimit = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error('User not found');
  
  // Free tier check
  if (user.current_plan === 'free') {
    if (user.analysis_count >= user.analysis_limit) {
      throw new Error(`You've used all ${user.analysis_limit} free analyses. Upgrade for more.`);
    }
    return true;
  }

  // Paid plan checks
  if (!user.stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  // Reset counter if billing period renewed
  if (user.next_billing_reset && new Date() > new Date(user.next_billing_reset)) {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        analysis_count: 0,
        next_billing_reset: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      })
      .eq('id', userId);

    if (updateError) throw new Error('Failed to reset analysis count');
    return true;
  }

  if (user.analysis_count >= user.analysis_limit) {
    throw new Error(`You've used ${user.analysis_count}/${user.analysis_limit} analyses this period.`);
  }

  return true;
};