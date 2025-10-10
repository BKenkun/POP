
import { Order, OrderSchema } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs, query, orderBy, Timestamp, collection } from 'firebase/firestore';
import OrdersClientPage from './orders-client-page';
import { z } from 'zod';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

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

    } catch (error) {
        console.error("❌ Critical error fetching orders from Firestore. This might be due to a missing composite index. Please check the browser console for a link to create it.", error);
        return [];
    }

    const validatedOrders = allOrdersRaw.reduce((acc: Order[], rawOrder: any) => {
        const result = OrderSchema.safeParse(rawOrder);
        if (result.success) {
            if (!acc.some(o => o.id === result.data.id)) {
                acc.push(result.data as Order);
            }
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
    
    const serializableOrders = validatedOrders.map(order => ({
        ...order,
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(0).toISOString()
    }));
    
    return serializableOrders as Order[];
}

async function OrderList() {
    const initialOrders = await getAllAdminOrders();
    return <OrdersClientPage initialOrders={initialOrders} />;
}

export default async function AdminOrdersPage() {
  return (
     <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Todos los Pedidos</h1>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center h-60">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }>
        <OrderList />
      </Suspense>
    </div>
  );
}
