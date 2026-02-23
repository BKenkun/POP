"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { Order, Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, collectionGroup, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
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
  const { isAdmin } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), where('active', '!=', false));
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setAllProducts(fetchedProducts);
    });
    return () => unsubscribe();
  }, [])

  const isAdminPath = pathname.startsWith('/admin');

  const showToast = useCallback((title: string, description: string, total: number) => {
      toast({
          title: (
              <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="font-bold">{title}</span>
              </div>
          ),
          description: (
              <div>
                  <p>{description}</p>
                  <p className="mt-1 font-medium">Total: {formatPrice(total)}</p>
              </div>
          )
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
  
  const showRealOrderToast = useCallback((order: Order) => {
      const firstItem = order.items[0];
      if (!firstItem) return;

      const customerName = order.customerName.split(' ')[0];
      const city = order.shippingAddress?.city || t('notifications.a_city');
      
      showToast(
          t('notifications.real_order_title'),
          t('notifications.recent_purchase_desc', { name: customerName, location: city, quantity: firstItem.quantity, product_name: firstItem.name }),
          order.total
      );

  }, [showToast, t]);

  const scheduleNextToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const randomDelay = Math.random() * 15000 + 12000;
    timeoutRef.current = setTimeout(() => {
      showRandomToast();
      scheduleNextToast();
    }, randomDelay);
  }, [showRandomToast]);


  useEffect(() => {
    if (isAdminPath || allProducts.length === 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    
    let unsubscribeOrders = () => {};

    if (isAdmin) {
        const ordersQuery = query(
          collectionGroup(db, 'orders'),
          orderBy('createdAt', 'desc'),
          where('createdAt', '>', Timestamp.now())
        );

        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
            if (isInitialLoad) {
                setIsInitialLoad(false);
                return;
            }
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const newOrder = change.doc.data() as Order;
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    showRealOrderToast(newOrder);
                    scheduleNextToast();
                }
            });
        });
    }

    const initialDelay = setTimeout(() => {
        showRandomToast();
        scheduleNextToast();
    }, 10000);

    return () => {
        unsubscribeOrders();
        clearTimeout(initialDelay);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
  }, [isAdminPath, allProducts, toast, showRandomToast, showRealOrderToast, scheduleNextToast, isInitialLoad, isAdmin]);

  return null;
}
