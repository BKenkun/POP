'use client';

import dynamic from 'next/dynamic';
import SubscriptionForm from './subscription-form';

const WelcomePopup = dynamic(() => import('@/components/welcome-popup'), { ssr: false });

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
