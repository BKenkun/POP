
import { Order, OrderSchema } from "@/lib/types";
// ¡IMPORTANTE! Importamos desde el nuevo archivo de admin para usar el SDK de Administrador
import { db } from '@/lib/firebase-admin'; 
import { Timestamp } from 'firebase-admin/firestore';
import OrdersClientPage from './orders-client-page';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Esta función convierte Timestamps de Firestore a strings ISO serializables
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
        // **FIX**: Use a collectionGroup query to get all orders from all user subcollections
        const ordersQuery = db.collectionGroup('orders');
        const ordersSnap = await ordersQuery.get();

        const allOrdersRaw: any[] = [];

        ordersSnap.forEach((doc) => {
            allOrdersRaw.push({
                ...processFirestoreData(doc.data()),
                id: doc.id,
                path: doc.ref.path,
            });
        });
        
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

        // Sort all combined orders by creation date, descending
        validatedOrders.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
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

    