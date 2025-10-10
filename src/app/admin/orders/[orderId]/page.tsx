
import { db } from '@/lib/firebase';
import { doc, getDoc, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { Order, OrderSchema } from '@/lib/types';
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

    let orderRaw: any | null = null;
    let path: string | null = null;

    try {
        // Primero, busca en la colección de reservas (para invitados)
        const reservationRef = doc(db, 'reservations', orderId);
        const reservationSnap = await getDoc(reservationRef);
        
        if (reservationSnap.exists()) {
            const data = reservationSnap.data();
            if (data) {
                orderRaw = data;
                path = reservationRef.path;
            }
        } else {
            // Si no se encuentra en reservas, busca en todas las subcolecciones de pedidos de usuarios
            const ordersQuery = query(collectionGroup(db, 'orders'), where('id', '==', orderId));
            const orderSnap = await getDocs(ordersQuery);
            
            if (!orderSnap.empty) {
                const docSnap = orderSnap.docs[0];
                path = docSnap.ref.path;
                const data = docSnap.data();
                if (data) {
                    orderRaw = data;
                }
            }
        }
    } catch (error) {
        console.error(`❌ Critical error fetching order ${orderId} from Firestore:`, error);
        return null;
    }


    if (orderRaw) {
        const sanitizedOrder = {
            ...orderRaw,
            id: orderRaw.id || orderId, // Asegura que el ID siempre esté presente
            createdAt: toDateSafe(orderRaw.createdAt),
            path: path, // Añade la ruta del documento para futuras acciones
        };

        const result = OrderSchema.safeParse(sanitizedOrder);
        if (result.success) {
            return result.data;
        } else {
            console.warn(`[Admin Order Detail] Invalid order object fetched. ID: ${orderId}, Reason:`, result.error.flatten());
            // No devolvemos el pedido si no es válido para evitar errores.
            return null;
        }
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
