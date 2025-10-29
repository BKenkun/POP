
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Calendar } from 'lucide-react';
import { Logo } from './logo';
import { Input } from './ui/input';

const AGE_VERIFICATION_KEY = 'age_verified';
const MIN_AGE = 18;

export default function AgeVerificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState({ day: '', month: '', year: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    // This effect runs only on the client
    const isVerified = localStorage.getItem(AGE_VERIFICATION_KEY);
    if (isVerified !== 'true') {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const isAgeVerified = useMemo(() => {
    const { day, month, year } = date;
    if (!day || !month || !year || year.length < 4) {
      setError('');
      return false;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) || dayNum > 31 || monthNum > 12) {
      setError('Por favor, introduce una fecha válida.');
      return false;
    }

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < MIN_AGE) {
      setError('Debes ser mayor de 18 años para entrar.');
      return false;
    }
    
    setError('');
    return true;
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
        setDate(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleConfirm = () => {
    if (isAgeVerified) {
      try {
        localStorage.setItem(AGE_VERIFICATION_KEY, 'true');
      } catch (e) {
        console.error("Could not save age verification to localStorage", e);
      }
      setIsOpen(false);
    }
  };
  
  const handleDeny = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-md text-center"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <DialogHeader className="space-y-4 items-center">
          <Logo className="h-12" />
          <DialogTitle className="text-2xl font-bold">Verificación de Edad</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Introduce tu fecha de nacimiento para continuar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <div className="flex justify-center items-center gap-2">
                <Input name="day" placeholder="DD" maxLength={2} value={date.day} onChange={handleInputChange} className="w-20 text-center text-lg" aria-label="Día de nacimiento"/>
                <Input name="month" placeholder="MM" maxLength={2} value={date.month} onChange={handleInputChange} className="w-20 text-center text-lg" aria-label="Mes de nacimiento"/>
                <Input name="year" placeholder="AAAA" maxLength={4} value={date.year} onChange={handleInputChange} className="w-24 text-center text-lg" aria-label="Año de nacimiento"/>
            </div>
             {error && (
                <p className="text-destructive text-sm mt-3">{error}</p>
            )}
        </div>
        <DialogFooter className="sm:justify-center gap-4">
           <Button type="button" variant="outline" onClick={handleDeny}>
            Salir
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!isAgeVerified}>
            Entrar
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
