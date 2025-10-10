import { Order, OrderSchema } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collection, collectionGroup, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import OrdersClientPage from './orders-client-page';
import { z } from 'zod';

function processFirestoreData(data: { [key: string]: any }): any {
  const processedData: { [key: string]: any } = {};
  for (const key in data) {
    const value = data[key];
    if (value instanceof Timestamp) {
      processedData[key] = value.toDate();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      processedData[key] = processFirestoreData(value);
    } else {
      processedData[key] = value;
    }
  }
  return processedData;
}


async function getAllAdminOrders(): Promise<Order[]> {
    const allOrdersRaw: any[] = [];
    try {
        const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
        const [guestOrdersSnap] = await Promise.all([
            getDocs(reservationsQuery),
        ]);

        guestOrdersSnap.forEach((doc) => {
            const data = doc.data();
            const processedData = processFirestoreData(data);
            allOrdersRaw.push({
                ...processedData,
                id: processedData.id || doc.id,
                path: doc.ref.path,
            });
        });

        // Now, let's fetch orders from users
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const userDoc of usersSnap.docs) {
            const userOrdersCol = collection(db, 'users', userDoc.id, 'orders');
            const userOrdersQuery = query(userOrdersCol, orderBy('createdAt', 'desc'));
            const userOrdersSnap = await getDocs(userOrdersQuery);
            userOrdersSnap.forEach((orderDoc) => {
                 const data = orderDoc.data();
                 const processedData = processFirestoreData(data);
                 allOrdersRaw.push({
                     ...processedData,
                     id: processedData.id || orderDoc.id,
                     path: orderDoc.ref.path,
                 });
            });
        }

    } catch (error) {
        console.error("❌ Critical error fetching orders from Firestore:", error);
        return []; // Return empty array on critical error
    }

    const validatedOrders = allOrdersRaw.reduce((acc: Order[], rawOrder: any) => {
        const result = OrderSchema.safeParse(rawOrder);
        if (result.success) {
            acc.push(result.data as Order);
        } else {
            console.warn(`[Admin Orders] Invalid order object filtered out. ID: ${rawOrder.id}, Reason:`, result.error.flatten());
        }
        return acc;
    }, []);
    
    validatedOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
    
    // Serialize date objects to strings before sending to client
    const serializableOrders = validatedOrders.map(order => ({
        ...order,
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(0).toISOString()
    }));
    
    return serializableOrders as Order[];
}


// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos de los pedidos.
export default async function AdminOrdersPage() {
  // 1. Obtenemos los datos en el servidor y nos aseguramos de que son seguros y serializables.
  const initialOrders = await getAllAdminOrders();

  // 2. Pasamos los datos "limpios" a un componente de cliente para su presentación.
  return <OrdersClientPage initialOrders={initialOrders} />;
}
