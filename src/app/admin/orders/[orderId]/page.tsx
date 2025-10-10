import { db } from '@/lib/firebase';
import { doc, getDoc, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { Order } from '@/lib/types';
import OrderDetailsClient from './order-details-client';
import { notFound } from 'next/navigation';

// Helper para convertir Timestamps de Firestore (que no son serializables) a strings
const toDateSafe = (timestamp: any): string => {
  if (!timestamp) return new Date(0).toISOString();
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  if (typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return new Date(0).toISOString();
};


async function getAdminOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) return null;

    let order: Order | null = null;
    let path: string | null = null;

    const ordersQuery = query(collectionGroup(db, 'orders'), where('id', '==', orderId));
    const orderSnap = await getDocs(ordersQuery);
    
    if (!orderSnap.empty) {
        path = orderSnap.docs[0].ref.path;
        const docSnap = await getDoc(orderSnap.docs[0].ref);
        if (docSnap.exists()) {
             order = docSnap.data() as Order;
             order.path = path;
        }
    } else {
        const reservationRef = doc(db, 'reservations', orderId);
        const reservationSnap = await getDoc(reservationRef);
        if (reservationSnap.exists()) {
            order = reservationSnap.data() as Order;
            order.path = reservationRef.path;
        }
    }

    if (order) {
        // **CRÍTICO (Estrategia 1)**: Convertir el objeto a uno plano y serializable antes de devolverlo
        return {
            ...order,
            createdAt: toDateSafe(order.createdAt),
        } as Order;
    }

    return null;
}

// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos del pedido específico.
export default async function OrderDetailPage({ params }: { params: { orderId: string }}) {
    const orderId = params.orderId;
    
    // 1. Obtener los datos en el servidor y sanearlos.
    const order = await getAdminOrderById(orderId);

    if (!order) {
        notFound();
    }
    
    // 2. Pasar los datos "limpios" y serializados al componente de cliente para su presentación.
    return <OrderDetailsClient initialOrder={order} />;
}
