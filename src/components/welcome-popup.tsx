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
    // We need to wait for the component to mount to access localStorage
    const hasVisited = localStorage.getItem('hasVisitedPopperStore');
    if (!hasVisited) {
      // Show the popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('hasVisitedPopperStore', 'true');
      }, 2000); // 2-second delay
      return () => clearTimeout(timer);
    }
  }, []);

  // Handler to pass to the SubscriptionForm to close the dialog on submit
  const handleSubscription = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-background text-foreground text-center p-8">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Percent className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-3xl font-headline text-primary">
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
