'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const WelcomePopup = dynamic(() => import('@/components/welcome-popup'), { ssr: false });
const SubscriptionForm = dynamic(() => import('@/components/subscription-form'), { ssr: false });

export default function ClientOnlyFeatures() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <WelcomePopup />
      <div className="my-12">
        <SubscriptionForm />
      </div>
    </>
  );
}
