
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Truck, Eye, Inbox, Phone } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collectionGroup, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';

// Using a more specific type for the orders state to handle serializable dates
type AdminDisplayOrder = Omit<Order, 'createdAt'> & { createdAt: string, path: string };

export default function AdminShippingPage() {
  const [shippingOrders, setShippingOrders] = useState<AdminDisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    const fetchShippingOrders = async () => {
      if (!firestore) {
        toast({ title: 'Error', description: 'Firestore no está disponible.', variant: 'destructive'});
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch ALL orders first, then filter on the client.
        // This avoids needing a composite index for `where('status', '==', 'En Reparto')` and `orderBy('createdAt')`.
        const ordersQuery = query(collectionGroup(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(ordersQuery);
        
        const allOrders: AdminDisplayOrder[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as Order;
          const createdAtISO = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();

          return {
            ...data,
            id: doc.id,
            path: doc.ref.path,
            createdAt: createdAtISO,
          };
        });

        // Now filter for the ones "En Reparto"
        const inShipping = allOrders.filter(order => order.status === 'En Reparto');
        setShippingOrders(inShipping);

      } catch (error: any) {
        console.error("Error fetching shipping orders:", error);
        toast({ 
          title: 'Error al cargar los envíos', 
          description: error.message || 'No se pudieron obtener los envíos en reparto.',
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShippingOrders();
  }, [firestore, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Envíos</h1>
          <p className="text-muted-foreground">Supervisa y gestiona todos los pedidos que están actualmente en reparto.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Pedidos en Reparto ({shippingOrders.length})</CardTitle>
            <CardDescription>Esta es la lista de todos los paquetes que han salido del almacén y están en camino a ser entregados.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg bg-secondary/50">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">Cargando envíos...</h3>
                </div>
            ) : shippingOrders.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
                    <Inbox className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
                    <h3 className="mt-4 text-lg font-semibold">No hay pedidos en reparto</h3>
                    <p className="text-muted-foreground">Cuando un pedido se marque como "En Reparto", aparecerá aquí.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nº Pedido</TableHead>
                        <TableHead>Fecha Salida</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Dirección</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {shippingOrders.map((order) => (
                        <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(order.id.length - 7).toUpperCase()}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground flex items-center gap-2">
                             <Phone className="h-4 w-4" />
                            {order.shippingAddress?.phone || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {order.shippingAddress ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}` : 'No disponible'}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="default" size="sm">
                                <Link href={`/admin/shipping/${order.id}?path=${encodeURIComponent(order.path)}`}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Gestionar Entrega
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
