'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { POPUP_DISMISSED_KEY } from './welcome-popup';
import { Button } from './ui/button';
import { Gift } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';

const AGE_VERIFICATION_KEY = 'age_verified';

const WelcomePopup = dynamic(() => import('@/components/welcome-popup'), {
  ssr: false,
  loading: () => null,
});

export const MinimizedWelcomeButton = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const ageVerified =
        localStorage.getItem(AGE_VERIFICATION_KEY) === 'true';

      const isDismissed =
        localStorage.getItem(POPUP_DISMISSED_KEY) === 'true';

      setIsVisible(ageVerified && isDismissed);
    };

    checkVisibility();

    window.addEventListener('storage', checkVisibility);
    window.addEventListener('age-verification-complete', checkVisibility);

    return () => {
      window.removeEventListener('storage', checkVisibility);
      window.removeEventListener(
        'age-verification-complete',
        checkVisibility
      );
    };
  }, []);

  const handleReopen = () => {
    try {
      localStorage.removeItem(POPUP_DISMISSED_KEY);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="default"
      size="icon"
      onClick={handleReopen}
      className="relative h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-pulse-slow"
      aria-label={t('popups.welcome_open_offer_aria')}
    >
      <Gift className="h-7 w-7" />
    </Button>
  );
};

export default function WelcomePopupLoader() {
  const { user } = useAuth();

  const [isClient, setIsClient] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  const checkAgeAndPopup = () => {
    const ageVerified =
      localStorage.getItem(AGE_VERIFICATION_KEY) === 'true';

    setIsAgeVerified(ageVerified);

    if (!ageVerified) {
      setIsDismissed(true);
      return;
    }

    const dismissed =
      localStorage.getItem(POPUP_DISMISSED_KEY) === 'true';

    const subscribed =
      localStorage.getItem('popper_newsletter_subscribed') === 'true';

    setIsDismissed(dismissed || subscribed);
  };

  const handleStateChange = ({
    isOpen,
    isDismissed,
  }: {
    isOpen: boolean;
    isDismissed: boolean;
  }) => {
    setIsDismissed(isDismissed);
  };

  useEffect(() => {
    setIsClient(true);
    checkAgeAndPopup();

    window.addEventListener(
      'age-verification-complete',
      checkAgeAndPopup
    );

    window.addEventListener('storage', checkAgeAndPopup);

    return () => {
      window.removeEventListener(
        'age-verification-complete',
        checkAgeAndPopup
      );

      window.removeEventListener('storage', checkAgeAndPopup);
    };
  }, []);

  if (!isClient || user || !isAgeVerified) return null;

  return (
    <WelcomePopup
      isDismissed={isDismissed}
      onStateChange={handleStateChange}
    />
  );
}
