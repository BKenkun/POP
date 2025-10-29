'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { Logo } from './logo';

const AGE_VERIFICATION_KEY = 'age_verified';

export default function AgeVerificationPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // This effect runs only on the client
    const isVerified = localStorage.getItem(AGE_VERIFICATION_KEY);
    if (isVerified !== 'true') {
      // Delay showing the popup slightly to allow the page to render
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConfirm = () => {
    try {
      localStorage.setItem(AGE_VERIFICATION_KEY, 'true');
    } catch (e) {
      console.error("Could not save age verification to localStorage", e);
    }
    setIsOpen(false);
  };

  const handleDeny = () => {
    // Redirects to a neutral site if the user is underage
    window.location.href = 'https://www.google.com';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-md text-center" 
        onInteractOutside={(e) => e.preventDefault()} // Prevents closing on overlay click
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevents closing with Escape key
        hideCloseButton={true} // Custom prop to hide the 'X' button
      >
        <DialogHeader className="space-y-4 items-center">
          <Logo className="h-12" />
          <DialogTitle className="text-2xl font-bold">Verificación de Edad</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Debes tener al menos 18 años para acceder a este sitio web.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <AlertTriangle className="h-16 w-16 text-primary mx-auto" strokeWidth={1.5}/>
             <p className="mt-4 text-sm text-muted-foreground">
                Por favor, confirma que cumples con el requisito de edad legal para continuar.
            </p>
        </div>
        <DialogFooter className="sm:justify-center gap-4">
          <Button type="button" variant="outline" onClick={handleDeny}>
            No, soy menor de edad
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Sí, soy mayor de 18 años
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// We need to augment the DialogContentProps type to accept our custom prop
declare module '@radix-ui/react-dialog' {
    interface DialogContentProps {
        hideCloseButton?: boolean;
    }
}
