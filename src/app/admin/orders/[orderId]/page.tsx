
import { getOrderById } from '@/app/actions/admin-data';
import OrderDetailsClient from './order-details-client';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener los datos de un pedido específico.
export default async function OrderDetailPage({ params, searchParams }: { params: { orderId: string }, searchParams: { path: string } }) {
  const { orderId } = params;
  const { path } = searchParams;
  
  // Fetch order data on the server
  const order = await getOrderById(orderId, path);

  // If no order is found, render the 404 page.
  if (!order) {
     return (
        <div className="text-center space-y-4 py-10">
            <h2 className="text-2xl font-bold">Pedido no encontrado</h2>
            <p className="text-muted-foreground">No hemos podido encontrar un pedido con el ID: {orderId}</p>
            <Button asChild variant="outline">
                <Link href="/admin/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Todos los Pedidos
                </Link>
            </Button>
        </div>
    );
  }
  
  // Pass the fetched order to the client component for rendering.
  return <OrderDetailsClient initialOrder={order} />;
}
