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
import { Percent } from 'lucide-react';

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastVisit = localStorage.getItem('lastPopperStoreVisit');
    const now = new Date().getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    let shouldShowPopup = false;
    
    if (!lastVisit) {
      shouldShowPopup = true;
    } else {
      const lastVisitTime = parseInt(lastVisit, 10);
      if (now - lastVisitTime > oneDayInMs) {
        shouldShowPopup = true;
      }
    }

    if (shouldShowPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('lastPopperStoreVisit', now.toString());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscription = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <SubscriptionForm onSubscribed={handleSubscription} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
