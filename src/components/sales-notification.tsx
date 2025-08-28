"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

const names = ["Javier G.", "Laura M.", "Carlos S.", "Ana P.", "David R.", "Sofía L."];
const locations = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "A Coruña", "Granada", "Elche", "Oviedo", "Cartagena", "Jerez", "Pamplona", "Almería", "San Sebastián", "Burgos", "Albacete", "Santander", "Castellón", "Badajoz", "Logroño", "Salamanca", "Huelva", "Lleida", "Tarragona", "Cádiz", "Jaén", "Ourense", "Lugo"];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function SalesNotification() {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showRandomToast = useCallback(() => {
    const product = getRandomItem(products);
    const quantity = Math.floor(Math.random() * 2) + 1;
    const name = getRandomItem(names);
    const location = getRandomItem(locations);
    const total = product.price * quantity;

    toast({
      title: (
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span className="font-bold">¡Compra Reciente!</span>
        </div>
      ),
      description: (
        <div>
          <p><span className="font-semibold">{name}</span> de {location} acaba de comprar {quantity} x {product.name}.</p>
          <p className="mt-1 font-medium">Total: {formatPrice(total)}</p>
        </div>
      )
    });
  }, [toast]);

  const scheduleNextToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const randomDelay = Math.random() * 10000 + 8000; // Between 8-18 seconds
    timeoutRef.current = setTimeout(() => {
      showRandomToast();
      scheduleNextToast();
    }, randomDelay);
  }, [showRandomToast]);


  useEffect(() => {
    // Start the first notification after an initial delay
    const initialDelay = setTimeout(() => {
        showRandomToast();
        scheduleNextToast();
    }, 8000);

    return () => {
        clearTimeout(initialDelay);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
  }, [toast, showRandomToast, scheduleNextToast]);

  return null; // This component doesn't render anything itself
}
