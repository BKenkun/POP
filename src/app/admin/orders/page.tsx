
import { Order } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collection, collectionGroup, getDocs, query, orderBy } from 'firebase/firestore';
import OrdersClientPage from './orders-client-page';


// Helper para convertir Timestamps de Firestore a strings serializables
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
  try {
    const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const [userOrdersSnap, guestOrdersSnap] = await Promise.all([
        getDocs(userOrdersQuery),
        getDocs(reservationsQuery),
    ]);

    const allOrdersRaw: any[] = [];

    userOrdersSnap.forEach(doc => {
        const orderData = doc.data();
        allOrdersRaw.push({ ...orderData, path: doc.ref.path });
    });

    guestOrdersSnap.forEach(doc => {
        const orderData = doc.data();
        // Evita duplicados si una reserva también existe como pedido (poco probable pero seguro)
        if (!allOrdersRaw.some(o => o.id === orderData.id)) {
            allOrdersRaw.push({ ...orderData, path: doc.ref.path });
        }
    });
    
    // Ordenar la lista combinada final por fecha de forma segura
    const sortedOrders = allOrdersRaw.sort((a, b) => {
        const dateA = new Date(toDateSafe(a.createdAt)).getTime();
        const dateB = new Date(toDateSafe(b.createdAt)).getTime();
        return dateB - dateA; // Orden descendente (más recientes primero)
    });

    // **CRÍTICO**: Serializar los datos antes de enviarlos como JSON
    const safeOrders: Order[] = sortedOrders.map(order => ({
        ...order,
        createdAt: toDateSafe(order.createdAt),
    }));
    
    return safeOrders;

  } catch (error) {
    console.error("Error fetching admin orders directly in Server Component:", error);
    // En caso de error, devolvemos un array vacío para no romper la página.
    // Una mejora futura podría ser pasar un objeto de error al cliente.
    return [];
  }
}


// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener los datos y pasarlos al componente de cliente.
export default async function AdminOrdersPage() {
  const initialOrders = await getAllAdminOrders();
  return <OrdersClientPage initialOrders={initialOrders} />;
}
