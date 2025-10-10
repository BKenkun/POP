
import { Order, OrderSchema } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collection, collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import OrdersClientPage from './orders-client-page';
import { z } from 'zod';

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
  // Return a default date for invalid formats
  return new Date(0).toISOString();
};


async function getAllAdminOrders(): Promise<Order[]> {
    const allOrdersRaw: any[] = [];
    try {
        const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
        const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

        const [userOrdersSnap, guestOrdersSnap] = await Promise.all([
            getDocs(userOrdersQuery),
            getDocs(reservationsQuery),
        ]);

        const processSnapshot = (snap: any) => {
            snap.forEach((doc: any) => {
                const data = doc.data();
                allOrdersRaw.push({
                    ...data,
                    id: data.id || doc.id,
                    createdAt: toDateSafe(data.createdAt),
                    path: doc.ref.path,
                });
            });
        }

        processSnapshot(userOrdersSnap);
        processSnapshot(guestOrdersSnap);
    } catch (error) {
        // STRATEGY 10: Log the detailed error on the server for monitoring
        console.error("❌ Critical error fetching orders from Firestore:", error);
        // Return an empty array to prevent the page from crashing.
        return [];
    }

    // STRATEGY 8: Validate and filter each order using Zod
    const validatedOrders = allOrdersRaw.reduce((acc: Order[], rawOrder: any) => {
        const result = OrderSchema.safeParse(rawOrder);
        if (result.success) {
            acc.push(result.data);
        } else {
            console.warn(`[Admin Orders] Invalid order object filtered out. ID: ${rawOrder.id}, Reason:`, result.error.flatten());
        }
        return acc;
    }, []);
    
    // Eliminar duplicados si una reserva se convirtió en pedido de usuario
    const uniqueOrders = validatedOrders.filter((order, index, self) =>
        index === self.findIndex((o) => o.id === order.id)
    );

    // Ordenar cronológicamente después de unificar y sanear las fechas
    uniqueOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
    });
    
    return uniqueOrders;
}


// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos de los pedidos.
export default async function AdminOrdersPage() {
  // 1. Obtenemos los datos en el servidor y nos aseguramos de que son seguros y serializables.
  const initialOrders = await getAllAdminOrders();

  // 2. Pasamos los datos "limpios" a un componente de cliente para su presentación.
  return <OrdersClientPage initialOrders={initialOrders} />;
}
