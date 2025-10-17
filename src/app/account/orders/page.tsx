
'use client';

import { useAuth } from "@/context/auth-context";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
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
import { Loader2, ShoppingBag, Eye } from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function OrdersPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  
  const ordersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // **FIX**: Query the user's subcollection for orders
    return query(
        collection(firestore, 'users', user.uid, 'orders'), 
        orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);
  
  const { data: orders, isLoading: loading } = useCollection<Order>(ordersQuery);

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
        
        {!orders || orders.length === 0 ? (
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
                    <TableCell>{order.createdAt instanceof Date ? order.createdAt.toLocaleDateString('es-ES') : 'Fecha inválida'}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/account/orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                            </Link>
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

    
