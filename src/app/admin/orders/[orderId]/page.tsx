
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collectionGroup, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import OrderDetailsClient from './order-details-client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// --- Componente Contenedor (Cliente) ---
// Responsabilidad: Obtener los datos de un pedido específico desde el cliente.
export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const firestore = useFirestore();

    const [order, setOrder] = useState<Order | null | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId || !firestore) return;

        const fetchOrder = async () => {
            setLoading(true);
            try {
                // Find the order across all user subcollections
                const ordersQuery = query(collectionGroup(firestore, 'orders'), where('id', '==', orderId));
                const querySnapshot = await getDocs(ordersQuery);

                if (querySnapshot.empty) {
                    setOrder(null); // Not found
                } else {
                    const orderDoc = querySnapshot.docs[0];
                    const orderData = orderDoc.data() as Omit<Order, 'id'>;

                     const createdAt = orderData.createdAt && (orderData.createdAt as any).toDate 
                        ? (orderData.createdAt as any).toDate().toISOString()
                        : new Date().toISOString();

                    setOrder({
                        ...orderData,
                        id: orderDoc.id,
                        path: orderDoc.ref.path, // Save the path for updates
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
    }, [orderId, firestore]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Buscando pedido...</p>
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
    
    return <OrderDetailsClient initialOrder={order} />;
}

    