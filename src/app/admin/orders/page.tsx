
'use client';

import { Order, OrderSchema } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy } from 'firebase/firestore';
import OrdersClientPage from './orders-client-page';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function OrderList() {
    const firestore = useFirestore();
    
    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collectionGroup(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: rawOrders, isLoading } = useCollection<Order>(ordersQuery);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg bg-secondary/50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="mt-4 text-lg font-semibold">Cargando pedidos...</h3>
                <p className="text-muted-foreground">Esto puede tardar un momento.</p>
            </div>
        );
    }

    // Assign the path to each order for the client component
    const ordersWithPaths = rawOrders?.map(order => ({
        ...order,
        // The path isn't directly available in client-side queries,
        // so we construct it. This is primarily for the update action.
        path: `users/${order.userId}/orders/${order.id}`,
    })) || [];
    
    // Zod validation on the client
    const validatedOrders = ordersWithPaths.reduce((acc: Order[], order: any) => {
        const result = OrderSchema.safeParse(order);
        if (result.success) {
            acc.push(result.data as Order);
        } else {
            console.warn(`[Admin Orders] Invalid object filtered out. ID: ${order.id}, Reason:`, result.error.flatten());
        }
        return acc;
    }, []);

    return <OrdersClientPage initialOrders={validatedOrders} />;
}

export default function AdminOrdersPage() {
  return (
     <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Todos los Pedidos</h1>
        <p className="text-muted-foreground">Pedidos de usuarios y reservas de invitados.</p>
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
