"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

const names = ["Javier G.", "Laura M.", "Carlos S.", "Ana P.", "David R.", "Sofía L."];
const locations = ["Alicante", "Elche", "Benidorm", "Torrevieja", "Orihuela", "Alcoy", "Denia", "San Vicente del Raspeig"];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function SalesNotification() {
  const { toast } = useToast();


  useEffect(() => {
    const showRandomToast = () => {
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
    };
    
    // Show the first toast after a short delay
    const firstTimeout = setTimeout(showRandomToast, 8000);

    // Then show toasts at a random interval
    const interval = setInterval(() => {
        showRandomToast();
    }, Math.random() * 10000 + 5000); // Between 5-15 seconds

    return () => {
        clearTimeout(firstTimeout);
        clearInterval(interval);
    };
  }, [toast]);

  return null; // This component doesn't render anything itself
}

    