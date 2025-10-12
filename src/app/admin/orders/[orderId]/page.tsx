
'use client';

import { Order } from '@/lib/types';
import OrderDetailsClient from './order-details-client';
import { notFound, useParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const firestore = useFirestore();

    const orderQuery = useMemoFirebase(() => {
        if (!firestore || !orderId) return null;
        // Since we don't know the userId, we query the collection group
        return query(collectionGroup(firestore, 'orders'), where('id', '==', orderId));
    }, [firestore, orderId]);

    const { data: orders, isLoading } = useCollection<Order>(orderQuery);

    if (isLoading) {
        return <div className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!orders || orders.length === 0) {
        // Use notFound() for a standard 404 page, or return a custom component.
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
    
    // There should only be one order with a unique ID
    const order = orders[0];
    // Reconstruct the path for update operations
    const orderWithPath = {
        ...order,
        path: `users/${order.userId}/orders/${order.id}`,
    };

    return <OrderDetailsClient initialOrder={orderWithPath} />;
}
