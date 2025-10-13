
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { Eye, Package } from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Combined type for order with its user's name
interface OrderWithUserName extends Order {
    userName: string;
}

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<OrderWithUserName[]>([]);
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleFetchAllOrders = async () => {
    setLoading(true);
    setAllOrders([]);
    toast({ title: 'Cargando todos los pedidos...', description: 'Esto puede tardar un momento.' });

    try {
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const ordersPromises: Promise<OrderWithUserName[]>[] = [];

      usersSnapshot.forEach(userDoc => {
        const userName = userDoc.data().displayName || userDoc.data().email || 'Usuario Desconocido';
        const ordersRef = collection(firestore, 'users', userDoc.id, 'orders');
        const ordersPromise = getDocs(ordersRef).then(ordersSnapshot => {
          return ordersSnapshot.docs.map(orderDoc => {
            const orderData = orderDoc.data() as Order;
            // Convert Firestore Timestamps to serializable Dates
            const createdAt = orderData.createdAt && (orderData.createdAt as any).toDate 
                ? (orderData.createdAt as any).toDate() 
                : new Date();
            
            return {
              ...orderData,
              id: orderDoc.id,
              createdAt: createdAt,
              userName: userName, // Add user's name to the order object
            } as OrderWithUserName;
          });
        });
        ordersPromises.push(ordersPromise);
      });

      const ordersByAllUsers = await Promise.all(ordersPromises);
      const flattenedOrders = ordersByAllUsers.flat();
      
      // Sort orders by date descending
      flattenedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAllOrders(flattenedOrders);
      toast({ title: 'Pedidos cargados', description: `Se encontraron ${flattenedOrders.length} pedidos.` });

    } catch (error: any) {
      console.error("Error fetching all orders:", error);
      toast({ title: 'Error al cargar los pedidos', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered':
        case 'entregado':
            return 'default';
        case 'shipped':
        case 'enviado':
            return 'secondary';
        case 'pending':
        case 'pendiente':
        case 'reserva recibida':
        case 'pago pendiente de verificación':
            return 'outline';
        case 'cancelled':
        case 'cancelado':
            return 'destructive';
        default:
            return 'secondary';
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Todos los Pedidos</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona todos los pedidos de la tienda.
          </p>
        </div>
        <Button onClick={handleFetchAllOrders} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Users className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Cargando...' : 'Cargar Todos los Pedidos'}
        </Button>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Listado de Pedidos</CardTitle>
            <CardDescription>Aquí se listan todos los pedidos de la tienda. Haz clic en el botón para empezar.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg bg-secondary/50">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">Cargando pedidos...</h3>
                    <p className="text-muted-foreground">Esto puede tardar un momento.</p>
                </div>
            ) : allOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
                    <Package className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
                    <h3 className="mt-4 text-lg font-semibold">No hay pedidos cargados</h3>
                    <p className="text-muted-foreground">Haz clic en "Cargar Todos los Pedidos" para buscarlos en la base de datos.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nº Pedido</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {allOrders.map((order) => (
                        <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(order.id.length - 7).toUpperCase()}</TableCell>
                        <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES') : 'N/A'}</TableCell>
                        <TableCell>
                            <div>
                                {order.userName}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(order.status)}>
                            {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/orders/${order.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver
                                </Link>
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>

    </div>
  );
}

    