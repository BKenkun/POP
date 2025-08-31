'use client';

import dynamic from 'next/dynamic';

// Dynamically import the WelcomePopup and disable SSR
const WelcomePopup = dynamic(() => import('@/components/welcome-popup'), { ssr: false });

export default function ClientOnlyWelcomePopup() {
  return <WelcomePopup />;
}
