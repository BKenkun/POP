
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { getAllAdminOrders } from '@/app/actions/admin-data';
import OrdersClientPage from './orders-client-page';
import type { Order } from '@/lib/types';


async function OrderList() {
    const allOrders = await getAllAdminOrders();

    // Sort orders by date descending after fetching
    const sortedOrders = allOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
    
    return <OrdersClientPage initialOrders={sortedOrders} />;
}

export default async function AdminOrdersPage() {
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
