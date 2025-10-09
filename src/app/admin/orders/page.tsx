
'use client';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collectionGroup, query, onSnapshot, orderBy, collection, getDocs } from "firebase/firestore";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, Eye } from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query for registered user orders and guest reservations simultaneously
    const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const fetchAllOrders = async () => {
        try {
            const [userOrdersSnapshot, reservationsSnapshot] = await Promise.all([
                getDocs(userOrdersQuery),
                getDocs(reservationsQuery)
            ]);

            const userOrders = userOrdersSnapshot.docs.map(doc => ({
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
            } as Order));

            const guestOrders = reservationsSnapshot.docs.map(doc => ({
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
            } as Order));

            const allOrders = [...userOrders, ...guestOrders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            
            // Remove duplicates just in case
            const uniqueOrders = Array.from(new Map(allOrders.map(order => [order.id, order])).values());

            setOrders(uniqueOrders);
        } catch (error) {
            console.error("Error fetching all orders:", error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchAllOrders();
    
    // Set up listeners for real-time updates
    const unsubUserOrders = onSnapshot(userOrdersQuery, (snapshot) => fetchAllOrders());
    const unsubReservations = onSnapshot(reservationsQuery, (snapshot) => fetchAllOrders());

    return () => {
        unsubUserOrders();
        unsubReservations();
    };

  }, []);

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Todos los Pedidos</h1>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Pedidos y Reservas</CardTitle>
            <CardDescription>Aquí se listan todas las compras y reservas de tus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
                    <Package className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
                    <h3 className="mt-4 text-lg font-semibold">No hay pedidos todavía</h3>
                    <p className="text-muted-foreground">Los nuevos pedidos aparecerán aquí cuando lleguen.</p>
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
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(order.id.length - 7).toUpperCase()}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
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
