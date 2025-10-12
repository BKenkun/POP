
import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/app/actions/admin-data';
import OrderDetailsClient from './order-details-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos de un pedido específico.
export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
    const { orderId } = params;
    const order = await getAdminOrderById(orderId);

    if (!order) {
        return (
            <div className="text-center space-y-4">
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
    
    return <OrderDetailsClient initialOrder={order} />;
}
