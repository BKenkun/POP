
import { Order, OrderSchema } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
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
        // This single query now fetches from both 'orders' and 'reservations' collections
        // if they are structured correctly for a collection group query.
        // This requires a single-field index exemption on 'createdAt' for the 'orders' collection group.
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

    } catch (error) {
        console.error("❌ Critical error fetching orders from Firestore. This might be due to a missing index. Please check the browser console for a link to create it or create a single-field exemption for 'createdAt' (descending) on the 'orders' collection group.", error);
        // On error, rethrow it so that the error boundary can catch it
        throw error;
    }

    const validatedOrders = allOrdersRaw.reduce((acc: Order[], rawOrder: any) => {
        // Guest orders are in 'reservations' collection, not 'orders', so we need to handle them.
        // We will treat reservations as orders.
        const collectionId = rawOrder.path.split('/')[0];
        const isReservation = collectionId === 'reservations';
        
        // Let's create a temporary schema that makes `userId` optional for validation
        const temporarySchema = OrderSchema.extend({
            userId: OrderSchema.shape.userId.optional(),
        })

        const result = isReservation ? temporarySchema.safeParse(rawOrder) : OrderSchema.safeParse(rawOrder);
        
        if (result.success) {
            if (!acc.some(o => o.id === result.data.id)) {
                 // Re-add userId if it was a reservation for consistency
                const finalData = {
                    ...result.data,
                    userId: result.data.userId || 'guest',
                };
                acc.push(finalData as Order);
            }
        } else {
            console.warn(`[Admin Orders] Invalid object filtered out. ID: ${rawOrder.id}, Reason:`, result.error.flatten());
        }
        return acc;
    }, []);
    
    // Final sort after merging, just in case
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
