'use client';

import dynamic from 'next/dynamic';

const WelcomePopup = dynamic(() => import('@/components/welcome-popup'), { ssr: false });

export default function ClientOnlyFeatures() {
  return (
    <>
      <WelcomePopup />
    </>
  );
}
