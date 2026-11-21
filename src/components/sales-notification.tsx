"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from '@/context/language-context';

const internationalData = {
  "Spain": {
    names: ["Javier G.", "Laura M.", "Carlos S.", "Ana P.", "David R.", "Sofia L."],
    cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Malaga", "Bilbao", "Alicante"],
  },
  "France": {
    names: ["Lucas M.", "Chloe D.", "Leo P.", "Manon L.", "Gabriel F.", "Emma R."],
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux"],
  },
  "Germany": {
    names: ["Lukas S.", "Hanna M.", "Felix W.", "Mia K.", "Leon B.", "Sophie Z."],
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Dusseldorf", "Leipzig"],
  },
  "Italy": {
    names: ["Leonardo R.", "Sofia C.", "Alessandro F.", "Giulia G.", "Francesco M.", "Chiara B."],
    cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence"],
  },
  "Portugal": {
    names: ["Tiago S.", "Beatriz F.", "Diogo P.", "Mariana A.", "Joao C.", "Leonor M."],
    cities: ["Lisbon", "Porto", "Coimbra", "Braga", "Faro", "Aveiro"],
  },
};

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomCountry = () => getRandomItem(Object.keys(internationalData));

export function SalesNotification() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        const productsQuery = query(collection(db, 'products'), where('active', '!=', false));
        const snapshot = await getDocs(productsQuery);
        if (!active) return;
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setAllProducts(fetchedProducts);
      } catch {
        // Silenciar errores de lectura para no interrumpir la navegación pública
      }
    };
    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const isAdminPath = pathname.startsWith('/admin');
  const hasProducts = allProducts.length > 0;

  const showToast = useCallback((title: string, description: string, total: number) => {
      toast({
          title,
          description: `${description} — Total: ${formatPrice(total)}`,
      });
  }, [toast]);

  const showRandomToast = useCallback(() => {
    if (allProducts.length === 0) return;
    
    const country = getRandomCountry();
    const { names, cities } = internationalData[country as keyof typeof internationalData];

    const product = getRandomItem(allProducts);
    const quantity = Math.floor(Math.random() * 2) + 1;
    const name = getRandomItem(names);
    const location = getRandomItem(cities);
    const total = product.price * quantity;

    showToast(
      t('notifications.recent_purchase_title'),
      t('notifications.recent_purchase_desc', { name, location, quantity, product_name: product.name }),
      total
    );
  }, [showToast, allProducts, t]);

  const scheduleNextToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const randomDelay = Math.random() * 15000 + 12000;
    timeoutRef.current = setTimeout(() => {
      showRandomToastRef.current();
      scheduleNextToastRef.current();
    }, randomDelay);
  }, []);

  const showRandomToastRef = useRef(showRandomToast);
  const scheduleNextToastRef = useRef(scheduleNextToast);

  useEffect(() => {
    showRandomToastRef.current = showRandomToast;
    scheduleNextToastRef.current = scheduleNextToast;
  }, [showRandomToast, scheduleNextToast]);

  useEffect(() => {
    if (isAdminPath || !hasProducts) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const initialDelay = setTimeout(() => {
        showRandomToastRef.current();
        scheduleNextToastRef.current();
    }, 10000);

    return () => {
        clearTimeout(initialDelay);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
  }, [isAdminPath, hasProducts]);

  return null;
}
