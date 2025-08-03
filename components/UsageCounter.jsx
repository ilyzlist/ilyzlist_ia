// components/UsageCounter.jsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabaseClient';

export default function UsageCounter({ userId }) {
  const [usage, setUsage] = useState({ used: 0, limit: 1 });

  useEffect(() => {
    const fetchUsage = async () => {
      const { data } = await supabase
        .from('users')
        .select('analysesUsed, analysesLimit')
        .eq('id', userId)
        .single();
      
      if (data) setUsage(data);
    };
    fetchUsage();
  }, [userId]);

  return (
    <div className="text-sm text-gray-600 font-league-spartan">
      Analyses: {usage.used}/{usage.limit}
      {usage.used >= usage.limit && (
        <button 
          onClick={() => router.push('/account')}
          className="ml-2 text-[#3742D1] hover:underline"
        >
          Upgrade
        </button>
      )}
    </div>
  );
}
