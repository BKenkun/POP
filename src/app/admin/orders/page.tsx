
import { Order, OrderSchema } from "@/lib/types";
import { db } from '@/lib/firebase-admin'; 
import { Timestamp } from 'firebase-admin/firestore';
import OrdersClientPage from './orders-client-page';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// This function converts Firestore Timestamps to ISO strings serializable for the client.
function processFirestoreData(data: { [key: string]: any }): any {
  const processedData: { [key: string]: any } = {};
  for (const key in data) {
    const value = data[key];
    if (value instanceof Timestamp) {
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
        const ordersQuery = db.collectionGroup('orders').orderBy('createdAt', 'desc');
        const ordersSnap = await ordersQuery.get();

        if (ordersSnap.empty) {
            console.log("No orders found in the database.");
            return [];
        }

        const allOrders = ordersSnap.docs.map((doc) => {
            const rawData = doc.data();
            const processed = processFirestoreData(rawData);
            return {
                ...processed,
                id: doc.id,
                path: doc.ref.path,
            };
        });

        // Validate each object with Zod. This filters out any malformed data.
        const validatedOrders = allOrders.reduce((acc: Order[], rawOrder: any) => {
            const result = OrderSchema.safeParse(rawOrder);
            if (result.success) {
                acc.push(result.data as Order);
            } else {
                console.warn(`[Admin Orders] Invalid object filtered out. ID: ${rawOrder.id}, Reason:`, result.error.flatten());
            }
            return acc;
        }, []);
        
        return validatedOrders;

    } catch (error) {
        console.error("❌ Critical error fetching orders from Firestore.", error);
        // Propagate error to be caught by Next.js error boundary.
        // This will display the `error.tsx` file to the user.
        throw new Error("Failed to fetch orders from database. Please check server logs.");
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
