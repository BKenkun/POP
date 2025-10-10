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
  return new Date(0).toISOString();
};

// Esta función se ejecuta únicamente en el servidor
async function getAllAdminOrders(): Promise<Order[]> {
    const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const [userOrdersSnap, guestOrdersSnap] = await Promise.all([
        getDocs(userOrdersQuery),
        getDocs(reservationsQuery),
    ]);

    const allOrders: Order[] = [];

    userOrdersSnap.forEach(doc => {
        const orderData = doc.data() as Order;
        allOrders.push({ ...orderData, path: doc.ref.path });
    });

    guestOrdersSnap.forEach(doc => {
        const orderData = doc.data() as Order;
        if (!allOrders.some(o => o.id === orderData.id)) {
            allOrders.push({ ...orderData, path: doc.ref.path });
        }
    });
    
    // Ordenar y limpiar los datos para el cliente
    const sortedOrders = allOrders.sort((a, b) => {
        const dateA = new Date(toDateSafe(a.createdAt)).getTime();
        const dateB = new Date(toDateSafe(b.createdAt)).getTime();
        return dateB - dateA;
    });

    // **CRÍTICO**: Convertir los datos a un formato serializable antes de pasarlos al cliente
    return sortedOrders.map(order => ({
        ...order,
        createdAt: toDateSafe(order.createdAt),
    }));
}

// Este es un Componente de Servidor de Next.js
export default async function AdminOrdersPage() {
  // 1. Obtenemos los datos en el servidor
  const allOrders = await getAllAdminOrders();

  // 2. Pasamos los datos "limpios" (serializados) a un componente de cliente
  return <OrdersClientPage initialOrders={allOrders} />;
}
