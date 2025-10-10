import { Order, OrderSchema } from "@/lib/types";
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import OrdersClientPage from './orders-client-page';
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
    try {
        const ordersQuery = db.collection('orders').orderBy('createdAt', 'desc');
        const ordersSnap = await ordersQuery.get();

        const allOrdersRaw = ordersSnap.docs.map(doc => ({
            ...processFirestoreData(doc.data()),
            id: doc.id,
            path: doc.ref.path,
        }));
        
        const validatedOrders = allOrdersRaw.reduce((acc: Order[], rawOrder: any) => {
            const result = OrderSchema.safeParse({
                ...rawOrder,
                createdAt: rawOrder.createdAt ? new Date(rawOrder.createdAt) : new Date(0),
            });
            
            if (result.success) {
                acc.push(result.data as Order);
            } else {
                console.warn(`[Admin Orders] Invalid object filtered out. ID: ${rawOrder.id}, Reason:`, result.error.flatten());
            }
            return acc;
        }, []);
        
        // Final sort after processing, although the query should already handle it
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

    } catch (error) {
        console.error("❌ Critical error fetching orders from Firestore.", error);
        throw error; // Propagate error to be caught by Next.js error boundary
    }
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
          <p className="text-muted-foreground">Pedidos de usuarios y reservas de invitados.</p>
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
