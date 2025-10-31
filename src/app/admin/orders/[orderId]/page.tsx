
'use client';

import { useParams, notFound, useSearchParams } from 'next/navigation';
import OrderDetailsClient from './order-details-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';


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
    const orderDocRef = doc(db, decodeURIComponent(path));
    const unsubscribe = onSnapshot(orderDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            setOrder({ id: docSnap.id, path: docSnap.ref.path, ...data, createdAt } as Order);
        } else {
            setOrder(null);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching order details:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);


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
            <h2 className="text-2xl font-bold">Pedido no encontrado</h2>
            <p className="text-muted-foreground">No hemos podido encontrar un pedido con el ID: {orderId}</p>
            <Button asChild variant="outline">
                <Link href="/admin/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Todos los Pedidos
                </Link>
            </Button>
        </div>
    );
  }
  
  return <OrderDetailsClient initialOrder={order} />;
}
