
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import SubscriptionForm from './subscription-form';
import { Gift, Percent } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/language-context';

export const POPUP_DISMISSED_KEY = 'popper_popup_dismissed';
export const SUBSCRIBED_KEY = 'popper_newsletter_subscribed';

interface WelcomePopupProps {
    isDismissed: boolean;
    onStateChange: (state: { isOpen: boolean, isDismissed: boolean }) => void;
}

const WelcomePopup = ({ isDismissed, onStateChange }: WelcomePopupProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setIsOpen(false);
      onStateChange({ isOpen: false, isDismissed: true }); // Effectively hide it for logged-in users
      return;
    }

    try {
      const isSubscribed = localStorage.getItem(SUBSCRIBED_KEY);
      if (isSubscribed === 'true') {
        onStateChange({ isOpen: false, isDismissed: true });
        return;
      }

      if (isDismissed) {
         setIsOpen(false);
      } else {
        const timer = setTimeout(() => {
            setIsOpen(true);
            onStateChange({ isOpen: true, isDismissed: false });
        }, 2000); 
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("localStorage not available.", e);
    }
  }, [user, isDismissed, onStateChange]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onStateChange({ isOpen: false, isDismissed: true });
      try {
        localStorage.setItem(POPUP_DISMISSED_KEY, 'true');
      } catch (e) { console.error(e) }
    } else {
       onStateChange({ isOpen: true, isDismissed: false });
       try {
        localStorage.removeItem(POPUP_DISMISSED_KEY);
      } catch (e) { console.error(e) }
    }
  };
  
  const handleSubscriptionSuccess = () => {
    setIsOpen(false);
    onStateChange({ isOpen: false, isDismissed: true });
    try {
      localStorage.setItem(SUBSCRIBED_KEY, 'true');
      localStorage.removeItem(POPUP_DISMISSED_KEY);
    } catch (e) { console.error(e) }
  };
  
  return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-background text-foreground text-center p-8">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Percent className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-headline text-primary font-bold">
              {t('popups.welcome_title')}
            </DialogTitle>
            <DialogDescription className="text-lg text-foreground/80">
              {t('popups.welcome_subtitle_part1')}
              <span className="font-bold text-primary">{t('popups.welcome_subtitle_discount')}</span> {t('popups.welcome_subtitle_part2')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <SubscriptionForm onSubscribed={handleSubscriptionSuccess} />
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default WelcomePopup;

