
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, notFound, useSearchParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ShippingClient from './shipping-client';

function ShippingPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params.orderId as string;
    const orderPath = searchParams.get('path');
    const firestore = useFirestore();

    const [order, setOrder] = useState<Order | null | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderPath || !firestore) {
            if (orderId && !orderPath) {
                 console.error("Order path is missing from URL parameters.");
                 setOrder(null);
            }
            setLoading(false);
            return;
        };

        const fetchOrder = async () => {
            setLoading(true);
            try {
                const orderDocRef = doc(firestore, decodeURIComponent(orderPath));
                const docSnap = await getDoc(orderDocRef);

                if (!docSnap.exists()) {
                    setOrder(null);
                } else {
                    const orderData = docSnap.data() as Omit<Order, 'id'>;
                     const createdAt = orderData.createdAt && (orderData.createdAt as any).toDate 
                        ? (orderData.createdAt as any).toDate().toISOString()
                        : new Date().toISOString();

                    setOrder({
                        ...orderData,
                        id: docSnap.id,
                        path: docSnap.ref.path,
                        createdAt,
                    } as Order);
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, orderPath, firestore]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Cargando datos del pedido...</p>
            </div>
        );
    }
    
    if (order === null) {
        return (
            <div className="text-center space-y-4">
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
    
    return <ShippingClient initialOrder={order} />;
}


export default function AdminShippingDetailPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-60"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <ShippingPageContent />
        </Suspense>
    );
}
