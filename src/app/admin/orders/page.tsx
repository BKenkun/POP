
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Eye, Package, Truck } from 'lucide-react';
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
import { useFirestore } from '@/firebase';
import { collectionGroup, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';

// Using a more specific type for the orders state to handle serializable dates
type AdminDisplayOrder = Omit<Order, 'createdAt'> & { createdAt: string, path: string };

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<AdminDisplayOrder[]>([]);
  const [loading, setLoading] = useState(true); // Start loading immediately
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    const handleFetchAllOrders = async () => {
      if (!firestore) {
        toast({ title: 'Error', description: 'Firestore no está disponible.', variant: 'destructive'});
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const ordersQuery = query(collectionGroup(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(ordersQuery);
        
        const fetchedOrders: AdminDisplayOrder[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as Order;
          
          let createdAtISO = new Date().toISOString();
          if (data.createdAt) {
            if (data.createdAt instanceof Timestamp) {
              createdAtISO = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === 'string') {
              createdAtISO = data.createdAt;
            }
          }

          return {
            ...data,
            id: doc.id,
            path: doc.ref.path, // Capture the full path
            createdAt: createdAtISO,
          };
        });

        setAllOrders(fetchedOrders);
      } catch (error: any) {
        console.error("Error fetching all orders from client:", error);
        toast({ 
          title: 'Error al cargar los pedidos', 
          description: error.message.includes('permission-denied') 
            ? 'Permiso denegado. Asegúrate de que las reglas de seguridad de Firestore son correctas.' 
            : 'No se pudieron obtener los pedidos.',
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };

    handleFetchAllOrders();
  }, [firestore, toast]); // Dependency array ensures this runs once on mount

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
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Listado de Pedidos</CardTitle>
            <CardDescription>Aquí se listan todos los pedidos de la tienda, cargados automáticamente.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg bg-secondary/50">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">Cargando pedidos...</h3>
                    <p className="text-muted-foreground">Consultando la base de datos.</p>
                </div>
            ) : allOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
                    <Package className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
                    <h3 className="mt-4 text-lg font-semibold">No se encontraron pedidos</h3>
                    <p className="text-muted-foreground">La base de datos no contiene ningún pedido por ahora.</p>
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
                                {order.userId === 'guest' && <Badge variant="secondary" className="ml-2">Invitado</Badge>}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(order.status)}>
                            {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2">
                           <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/orders/${order.id}?path=${encodeURIComponent(order.path)}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver
                                </Link>
                            </Button>
                             <Button variant="outline" size="sm" disabled>
                                <Truck className="mr-2 h-4 w-4" />
                                Enviar
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
