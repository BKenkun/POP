
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Order } from '@/lib/types';
import OrderDetailsClient from './order-details-client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// --- Componente Contenedor (Cliente) ---
// Responsabilidad: Obtener los datos de un pedido específico desde el cliente.
export default function OrderDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params.orderId as string;
    const orderPath = searchParams.get('path'); // Get the document path from URL

    const [order, setOrder] = useState<Order | null | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderPath) {
            if (orderId) {
                 console.error("Order path is missing from URL parameters.");
                 setOrder(null);
                 setLoading(false);
            }
            return;
        };

        const fetchOrder = async () => {
            setLoading(true);
            try {
                // Use the full path to get the document directly
                const orderDocRef = doc(db, decodeURIComponent(orderPath));
                const docSnap = await getDoc(orderDocRef);

                if (!docSnap.exists()) {
                    setOrder(null); // Not found
                } else {
                    const orderData = docSnap.data() as Omit<Order, 'id'>;
                     const createdAt = orderData.createdAt && (orderData.createdAt as any).toDate 
                        ? (orderData.createdAt as any).toDate()
                        : new Date();

                    setOrder({
                        ...orderData,
                        id: docSnap.id,
                        path: docSnap.ref.path, // Save the path for updates
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
    }, [orderId, orderPath]);

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
    
    // Pass the fetched order to the client component for rendering.
    return <OrderDetailsClient initialOrder={order} />;
}
