
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { POPUP_DISMISSED_KEY } from './welcome-popup';
import { Button } from './ui/button';
import { Gift } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';

// Dynamically import the WelcomePopup component and disable SSR.
const WelcomePopup = dynamic(() => import('@/components/welcome-popup'), {
  ssr: false,
  loading: () => null,
});

export const MinimizedWelcomeButton = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    
    const handleReopen = () => {
        try {
            localStorage.removeItem(POPUP_DISMISSED_KEY);
            window.dispatchEvent(new Event('storage')); // Notify other components of storage change
        } catch (e) { console.error(e); }
    };
    
    // Listen for storage changes to show/hide the button
    useEffect(() => {
        const checkVisibility = () => {
            const isDismissed = localStorage.getItem(POPUP_DISMISSED_KEY) === 'true';
            setIsVisible(isDismissed);
        };
        
        checkVisibility(); // Initial check
        window.addEventListener('storage', checkVisibility);
        return () => window.removeEventListener('storage', checkVisibility);
    }, []);

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
  const [isDismissed, setIsDismissed] = useState(true);

  const handleStateChange = ({ isOpen, isDismissed }: { isOpen: boolean, isDismissed: boolean }) => {
    setIsDismissed(isDismissed);
  };
  
  // This effect ensures we only interact with localStorage on the client
  useEffect(() => {
    setIsClient(true);
    try {
        const dismissed = localStorage.getItem(POPUP_DISMISSED_KEY) === 'true';
        const subscribed = localStorage.getItem('popper_newsletter_subscribed') === 'true';
        setIsDismissed(dismissed || subscribed);
    } catch(e) {
      console.error(e);
    }
  }, []);

  if (!isClient || user) return null;
  
  return <WelcomePopup isDismissed={isDismissed} onStateChange={handleStateChange} />;
}
