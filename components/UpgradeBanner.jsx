'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdUpgrade } from 'react-icons/md';

export default function UpgradeBanner({ show }) {
  const [visible, setVisible] = useState(show);
  const router = useRouter();

  if (!visible) return null;

  return (
    <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-xl p-4 mx-4 mt-4 shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MdUpgrade className="text-2xl" />
          <p className="text-sm">
            You've reached your monthly analysis limit. Upgrade to unlock more analyses and features.
          </p>
        </div>
        <button onClick={() => setVisible(false)} className="text-sm font-bold ml-2">✕</button>
      </div>
      <button
        onClick={() => router.push('/plans')}
        className="mt-3 bg-[#3742D1] text-white px-4 py-2 rounded-full text-sm"
      >
        View Plans
      </button>
    </div>
  );
}
