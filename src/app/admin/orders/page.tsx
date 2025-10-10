
import { Order, OrderSchema } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs, query, orderBy, Timestamp } from 'firebase-admin/firestore';
import OrdersClientPage from './orders-client-page';
import { z } from 'zod';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// This function converts Firestore Timestamps to serializable Date objects (or ISO strings)
function processFirestoreData(data: { [key: string]: any }): any {
  const processedData: { [key: string]: any } = {};
  for (const key in data) {
    const value = data[key];
    if (value instanceof Timestamp) {
      // Convert to ISO string for safe serialization
      processedData[key] = value.toDate().toISOString();
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
        // A single, more efficient query that leverages a collection group index.
        // This will find documents in both 'orders' (sub-collection) and 'reservations' (root collection)
        // if they share the name 'orders' or an exemption is created.
        // The most robust way is to query across a group.
        const ordersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
        const ordersSnap = await getDocs(ordersQuery);
        
        ordersSnap.forEach((doc) => {
             const data = doc.data();
             allOrdersRaw.push({
                 ...processFirestoreData(data),
                 id: doc.id,
                 path: doc.ref.path,
             });
        });

        // Add reservations as a fallback in case the collection group query doesn't catch them
        const reservationsQuery = query(collectionGroup(db, 'reservations'), orderBy('createdAt', 'desc'));
        const reservationsSnap = await getDocs(reservationsQuery);

        reservationsSnap.forEach((doc) => {
            const data = doc.data();
            allOrdersRaw.push({
                ...processFirestoreData(data),
                id: doc.id,
                path: doc.ref.path,
            });
        });


    } catch (error) {
        console.error("❌ Critical error fetching orders from Firestore. This might be due to a missing composite index. Please check the browser console for a link to create it or create a single-field exemption for 'createdAt' (descending) on the 'orders' and 'reservations' collection groups.", error);
        throw error;
    }

    const validatedOrders = allOrdersRaw.reduce((acc: Order[], rawOrder: any) => {
        // Since dates are now ISO strings, we parse them to Date objects for validation
        const result = OrderSchema.safeParse({
            ...rawOrder,
            createdAt: rawOrder.createdAt ? new Date(rawOrder.createdAt) : undefined,
        });
        
        if (result.success) {
            // Avoid duplicates by checking if an order with the same ID already exists
            if (!acc.some(o => o.id === result.data.id)) {
                acc.push(result.data as Order);
            }
        } else {
            console.warn(`[Admin Orders] Invalid object filtered out. ID: ${rawOrder.id}, Reason:`, result.error.flatten());
        }
        return acc;
    }, []);
    
    // Sort all combined orders by date after validation
    validatedOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
    
    // Ensure data is serializable for the client component by converting dates back to strings
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
        <div>
          <h1 className="text-3xl font-bold">Todos los Pedidos</h1>
          <p className="text-muted-foreground">Pedidos y Reservas de la tienda.</p>
        </div>
      </div>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg bg-secondary/50">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Cargando pedidos...</h3>
            <p className="text-muted-foreground">Esto puede tardar un momento.</p>
        </div>
      }>
        <OrderList />
      </Suspense>
    </div>
  );
}
