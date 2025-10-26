'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OfferCountdownProps {
  endDate: string;
}

const calculateTimeLeft = (endDate: string) => {
  const difference = +new Date(endDate) - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-xl font-bold">{String(value).padStart(2, '0')}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export default function OfferCountdown({ endDate }: OfferCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft);

  if (!timerComponents.some(([unit, value]) => value > 0)) {
    return (
        <Alert variant="destructive">
            <Timer className="h-4 w-4" />
            <AlertTitle>¡Oferta Terminada!</AlertTitle>
            <AlertDescription>
                Esta oferta especial ha finalizado.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="text-center">
        <AlertTitle className="flex items-center justify-center gap-2 mb-2">
            <Timer className="h-4 w-4" />
            ¡Oferta por Tiempo Limitado!
        </AlertTitle>
        <AlertDescription>
            La oferta termina en:
            <div className="flex justify-center gap-4 mt-2">
                {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="Días" />}
                <TimeUnit value={timeLeft.hours} label="Horas" />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <TimeUnit value={timeLeft.seconds} label="Seg" />
            </div>
      </AlertDescription>
    </Alert>
  );
}
