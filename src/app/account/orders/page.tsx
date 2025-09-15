
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
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
import { Loader2, ShoppingBag } from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userOrders.push({
            ...data,
            // Convert Firestore Timestamp to JS Date if it's not already
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          } as Order);
        });
        setOrders(userOrders);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [user]);

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
            return 'outline';
        case 'cancelled':
        case 'cancelado':
            return 'destructive';
        default:
            return 'secondary';
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <div className="space-y-6">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">Mis Pedidos</h2>
            <p className="text-muted-foreground">
                Aquí puedes ver el historial de todas tus compras.
            </p>
        </div>
        
        {orders.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-center border-dashed border-2 rounded-lg">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
                <h3 className="mt-4 text-lg font-semibold">Aún no tienes pedidos</h3>
                <p className="text-muted-foreground">Tu historial de compras aparecerá aquí.</p>
            </div>
        ) : (
             <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Pedido Nº</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(order.id.length - 7)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" disabled>
                            Ver Detalles
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        )}
    </div>
  )
}
