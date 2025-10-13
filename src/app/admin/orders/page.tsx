
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Package, Truck, Inbox, Archive, CircleCheck, XCircle, Clock } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collectionGroup, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';

// Using a more specific type for the orders state to handle serializable dates
type AdminDisplayOrder = Omit<Order, 'createdAt'> & { createdAt: string, path: string };

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

const OrdersTable = ({ orders }: { orders: AdminDisplayOrder[] }) => {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
                <Inbox className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
                <h3 className="mt-4 text-lg font-semibold">No hay pedidos en esta sección</h3>
                <p className="text-muted-foreground">Los pedidos aparecerán aquí a medida que cambien de estado.</p>
            </div>
        );
    }

    return (
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
            {orders.map((order) => (
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
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/shipping/${order.id}?path=${encodeURIComponent(order.path)}`}>
                             <Truck className="mr-2 h-4 w-4" />
                             Enviar
                        </Link>
                    </Button>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    );
};


export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<AdminDisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
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
            path: doc.ref.path,
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
  }, [firestore, toast]);

  const { newOrders, pendingPaymentOrders, archivedOrders } = useMemo(() => {
    return {
        newOrders: allOrders.filter(o => o.status === 'Reserva Recibida'),
        pendingPaymentOrders: allOrders.filter(o => o.status === 'Pago Pendiente de Verificación'),
        archivedOrders: allOrders.filter(o => ['Enviado', 'Entregado', 'Cancelado'].includes(o.status)),
    }
  }, [allOrders]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona todos los pedidos de la tienda organizados por estado.
          </p>
        </div>
      </div>

       <Tabs defaultValue="new">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">
            <Package className="mr-2"/>
            Nuevos <Badge variant="secondary" className="ml-2">{newOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending-payment">
             <Clock className="mr-2"/>
            Pago Pendiente <Badge variant="secondary" className="ml-2">{pendingPaymentOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="archived">
             <Archive className="mr-2"/>
            Archivados <Badge variant="secondary" className="ml-2">{archivedOrders.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <Card>
            <CardContent className="pt-6">
                 {loading ? (
                    <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg bg-secondary/50">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h3 className="mt-4 text-lg font-semibold">Cargando pedidos...</h3>
                        <p className="text-muted-foreground">Consultando la base de datos.</p>
                    </div>
                ) : (
                    <>
                        <TabsContent value="new">
                            <OrdersTable orders={newOrders} />
                        </TabsContent>
                        <TabsContent value="pending-payment">
                            <OrdersTable orders={pendingPaymentOrders} />
                        </TabsContent>
                         <TabsContent value="archived">
                            <OrdersTable orders={archivedOrders} />
                        </TabsContent>
                    </>
                )}
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
