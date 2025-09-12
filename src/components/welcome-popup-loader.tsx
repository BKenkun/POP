
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the WelcomePopup component and disable SSR.
// This ensures it only renders on the client-side, where it can access localStorage.
const WelcomePopup = dynamic(() => import('@/components/welcome-popup'), {
  ssr: false,
});

export default function WelcomePopupLoader() {
  return <WelcomePopup />;
}
