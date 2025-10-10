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
        // Query 1: Get all guest reservations
        const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
        const guestOrdersSnap = await getDocs(reservationsQuery);
        guestOrdersSnap.forEach((doc) => {
            const data = doc.data();
            allOrdersRaw.push({
                ...processFirestoreData(data),
                id: doc.id,
                path: doc.ref.path,
            });
        });

        // Query 2: Get all user orders using a collectionGroup query
        const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
        const userOrdersSnap = await getDocs(userOrdersQuery);
        userOrdersSnap.forEach((doc) => {
             const data = doc.data();
             allOrdersRaw.push({
                 ...processFirestoreData(data),
                 id: doc.id,
                 path: doc.ref.path,
             });
        });

    } catch (error) {
        console.error("❌ Critical error fetching orders from Firestore. This might be due to a missing composite index. Please check the browser console for a link to create it.", error);
        // On critical error, return empty to prevent crashing. The UI will show "No orders".
        return [];
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
    
    // Sort all combined orders by date
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


// --- Server Container Component ---
// Responsibility: Fetch and sanitize order data.
export default async function AdminOrdersPage() {
  // 1. Fetch data on the server, ensuring it's secure and serializable.
  const initialOrders = await getAllAdminOrders();

  // 2. Pass the clean data to a Client Component for presentation.
  return <OrdersClientPage initialOrders={initialOrders} />;
}
