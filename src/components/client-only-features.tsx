'use client';

import dynamic from 'next/dynamic';

const WelcomePopup = dynamic(() => import('@/components/welcome-popup'), { ssr: false });
const SubscriptionForm = dynamic(() => import('@/components/subscription-form'), { ssr: false });

export default function ClientOnlyFeatures() {
  return (
    <>
      <WelcomePopup />
      <div className="my-12">
        <SubscriptionForm />
      </div>
    </>
  );
}
