
import { getAllOrders } from '@/app/actions/admin-data';
import OrdersClientPage from './orders-client-page';
import { Order } from '@/lib/types';

// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos de todos los pedidos.
export default async function AdminOrdersPage() {
  
  const orders: Order[] = await getAllOrders();

  // Convert Date objects to strings for serialization
  const serializableOrders = orders.map(order => ({
    ...order,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date().toISOString(),
  }));
  
  return <OrdersClientPage initialOrders={serializableOrders} />;
}
