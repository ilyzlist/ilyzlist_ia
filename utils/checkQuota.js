// utils/checkQuota.js
import { supabase } from '@/utils/supabaseClient';

/**
 * Checks if the user has quota to upload a new drawing.
 * @param {string} userId
 * @returns {Promise<{ allowed: boolean, message?: string }>}
 */
export async function checkUserQuota(userId) {
  if (!userId) return { allowed: false, message: 'User not logged in.' };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('analysis_quota, subscription_plan')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return { allowed: false, message: 'Unable to fetch user profile.' };
  }

  const { analysis_quota, subscription_plan } = profile;

  if (subscription_plan === 'premium') {
    return { allowed: true };
  }

  if (analysis_quota <= 0) {
    return {
      allowed: false,
      message: `Your ${subscription_plan} plan quota has been reached.`
    };
  }

  return { allowed: true };
}
