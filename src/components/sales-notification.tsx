
"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const internationalData = {
  "España": {
    names: ["Javier G.", "Laura M.", "Carlos S.", "Ana P.", "David R.", "Sofía L."],
    cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Bilbao", "Alicante"],
  },
  "France": {
    names: ["Lucas M.", "Chloé D.", "Léo P.", "Manon L.", "Gabriel F.", "Emma R."],
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux"],
  },
  "Deutschland": {
    names: ["Lukas S.", "Hanna M.", "Felix W.", "Mia K.", "Leon B.", "Sophie Z."],
    cities: ["Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"],
  },
  "Italia": {
    names: ["Leonardo R.", "Sofia C.", "Alessandro F.", "Giulia G.", "Francesco M.", "Chiara B."],
    cities: ["Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze"],
  },
  "Portugal": {
    names: ["Tiago S.", "Beatriz F.", "Diogo P.", "Mariana A.", "João C.", "Leonor M."],
    cities: ["Lisboa", "Porto", "Coimbra", "Braga", "Faro", "Aveiro"],
  },
};

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomCountry = () => getRandomItem(Object.keys(internationalData));

export function SalesNotification() {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), where('active', '!=', false));
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(fetchedProducts);
    });
    return () => unsubscribe();
  }, [])

  const isAdminPath = pathname.startsWith('/admin');

  const showRandomToast = useCallback(() => {
    if (products.length === 0) return;
    
    const country = getRandomCountry();
    const { names, cities } = internationalData[country as keyof typeof internationalData];

    const product = getRandomItem(products);
    const quantity = Math.floor(Math.random() * 2) + 1;
    const name = getRandomItem(names);
    const location = getRandomItem(cities);
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
  }, [toast, products]);

  const scheduleNextToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const randomDelay = Math.random() * 15000 + 12000; // Between 12-27 seconds
    timeoutRef.current = setTimeout(() => {
      showRandomToast();
      scheduleNextToast();
    }, randomDelay);
  }, [showRandomToast]);


  useEffect(() => {
    if (isAdminPath || products.length === 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const initialDelay = setTimeout(() => {
        showRandomToast();
        scheduleNextToast();
    }, 10000);

    return () => {
        clearTimeout(initialDelay);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
  }, [isAdminPath, products, toast, showRandomToast, scheduleNextToast]);

  return null;
}
