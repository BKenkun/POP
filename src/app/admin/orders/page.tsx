
import { Order } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collection, collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import OrdersClientPage from './orders-client-page';

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
    const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const [userOrdersSnap, guestOrdersSnap] = await Promise.all([
        getDocs(userOrdersQuery),
        getDocs(reservationsQuery),
    ]);

    const allOrders: Order[] = [];

    const processSnapshot = (snap: any) => {
        snap.forEach((doc: any) => {
            const data = doc.data();
            // **CRÍTICO (Estrategia 1 & 6)**: Asegurarse de que la fecha se serializa correctamente
            // y que el objeto se ajusta al tipo `Order` antes de añadirlo.
            allOrders.push({
                ...data,
                id: data.id || doc.id,
                createdAt: toDateSafe(data.createdAt),
                // Añadimos el `path` para futuras actualizaciones (Estrategia de Detalle de Pedido)
                path: doc.ref.path,
            } as Order);
        });
    }

    processSnapshot(userOrdersSnap);
    processSnapshot(guestOrdersSnap);
    
    // Eliminar duplicados si una reserva se convirtió en pedido de usuario
    const uniqueOrders = allOrders.filter((order, index, self) =>
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
