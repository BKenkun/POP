
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Eye, Package } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';
import { collection, getDocs, getFirestore, orderBy, query, Timestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleFetchAllOrders = async () => {
    if (!firestore) {
        toast({ title: 'Error', description: 'Servicio de base de datos no disponible.', variant: 'destructive'});
        return;
    }

    setLoading(true);
    setAllOrders([]);
    toast({ title: 'Cargando todos los pedidos...', description: 'Esto puede tardar un momento.' });

    try {
        const fetchedOrders: Order[] = [];
        
        // 1. Get all users
        const usersQuery = query(collection(firestore, 'users'));
        const usersSnap = await getDocs(usersQuery);

        if (usersSnap.empty) {
            console.warn('Admin: No user documents found.');
        }

        // 2. Iterate through users to get their orders
        for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;
            const ordersQuery = query(
                collection(firestore, 'users', userId, 'orders'),
                orderBy('createdAt', 'desc')
            );
            const ordersSnap = await getDocs(ordersQuery);

            ordersSnap.forEach(orderDoc => {
                const orderData = orderDoc.data();
                
                let createdAt: Date;
                if (orderData.createdAt instanceof Timestamp) {
                    createdAt = orderData.createdAt.toDate();
                } else if (typeof orderData.createdAt === 'string') {
                    createdAt = new Date(orderData.createdAt);
                } else {
                    createdAt = new Date(); // Fallback
                }
                
                fetchedOrders.push({
                    id: orderDoc.id,
                    ...orderData,
                    createdAt: createdAt.toISOString(), // Standardize to string
                    customerName: orderData.customerName || userDoc.data().displayName || 'Usuario Desconocido',
                } as Order);
            });
        }
        
        // 3. Sort all collected orders by date
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAllOrders(fetchedOrders);
        toast({ title: 'Pedidos cargados', description: `Se encontraron ${fetchedOrders.length} pedidos en total.` });

    } catch (error: any) {
      console.error("Error fetching all orders from client:", error);
      toast({ 
        title: 'Error al cargar los pedidos', 
        description: error.message || "No se pudieron obtener los pedidos. Revisa la consola para más detalles.", 
        variant: 'destructive' 
      });
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
                    <h3 className="mt-4 text-lg font-semibold">Buscando pedidos de todos los usuarios...</h3>
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
                                {order.customerName}
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
