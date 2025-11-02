
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

const POPUP_DISMISSED_KEY = 'popper_popup_dismissed';
const SUBSCRIBED_KEY = 'popper_newsletter_subscribed';

const WelcomePopup = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      setIsOpen(false);
      setIsMinimized(false);
      return;
    }

    try {
      const isSubscribed = localStorage.getItem(SUBSCRIBED_KEY);
      if (isSubscribed === 'true') {
        return;
      }

      const isDismissed = localStorage.getItem(POPUP_DISMISSED_KEY);
      if (isDismissed === 'true') {
          setIsMinimized(true);
      } else {
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 2000); 
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("localStorage not available.", e);
    }
  }, [user]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      setIsMinimized(true);
       try {
        localStorage.setItem(POPUP_DISMISSED_KEY, 'true');
      } catch (e) { console.error(e) }
    } else {
      setIsOpen(true);
      setIsMinimized(false);
       try {
        localStorage.removeItem(POPUP_DISMISSED_KEY);
      } catch (e) { console.error(e) }
    }
  };
  
  const handleSubscriptionSuccess = () => {
    setIsOpen(false);
    setIsMinimized(false);
    try {
      localStorage.setItem(SUBSCRIBED_KEY, 'true');
      localStorage.removeItem(POPUP_DISMISSED_KEY);
    } catch (e) { console.error(e) }
  };

  if (!isClient || user) {
    return null;
  }
  
  const MinimizedButton = () => {
    if (!isMinimized) return null;
    return (
       <Button
            variant="default"
            size="icon"
            onClick={() => handleOpenChange(true)}
            className="relative h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-pulse-slow"
            aria-label="Abrir oferta de suscripción"
        >
            <Gift className="h-7 w-7" />
        </Button>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-background text-foreground text-center p-8">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Percent className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-headline text-primary font-bold">
              ¡Bienvenido/a!
            </DialogTitle>
            <DialogDescription className="text-lg text-foreground/80">
              Suscríbete a nuestro boletín y obtén un{' '}
              <span className="font-bold text-primary">10% de descuento</span> en tu primera compra.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <SubscriptionForm onSubscribed={handleSubscriptionSuccess} />
          </div>
        </DialogContent>
      </Dialog>
      
      <MinimizedButton />
    </>
  );
};

export default WelcomePopup;
