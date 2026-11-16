
'use client';

import { useParams, notFound, useSearchParams } from 'next/navigation';
import OrderDetailsClient from './order-details-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getAdminOrdersAndUsersServer } from '@/app/actions/coupons-admin';


// This component is now a client component to fetch its own data.
export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const path = searchParams.get('path');

  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) {
        setOrder(null);
        setLoading(false);
        return;
    }
    const decodedPath = decodeURIComponent(path);
    const orderDocRef = doc(db, decodedPath);
    const unsubscribe = onSnapshot(orderDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            setOrder({ id: docSnap.id, path: docSnap.ref.path, ...data, createdAt } as Order);
        } else {
            setOrder(null);
        }
        setLoading(false);
    }, () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setLoading(false);
            return;
        }
        currentUser.getIdToken()
          .then((token) => getAdminOrdersAndUsersServer(token))
          .then((res) => {
            const found = res.orders.find(
              (o) => o.path === decodedPath || o.id === orderId
            );
            if (found) {
              setOrder({
                ...found,
                createdAt: found.createdAt ? new Date(found.createdAt) : new Date(),
              } as Order);
            } else {
              setOrder(null);
            }
          })
          .catch(() => {
            setOrder(null);
          })
          .finally(() => {
            setLoading(false);
          });
    });

    return () => unsubscribe();
  }, [path, orderId]);


  if (loading) {
     return (
        <div className="flex items-center justify-center h-60">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
     )
  }

  if (!order) {
     return (
        <div className="text-center space-y-4 py-10">
            <h2 className="text-2xl font-bold">Order not found</h2>
            <p className="text-muted-foreground">Could not find an order with ID: {orderId}</p>
            <Button asChild variant="outline">
                <Link href="/admin/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Orders
                </Link>
            </Button>
        </div>
    );
  }
  
  return <OrderDetailsClient initialOrder={order} />;
}
