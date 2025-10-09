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
import { Package, Eye } from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs, query, orderBy, collection } from 'firebase/firestore';

// Helper function to safely get a Date object from Firestore Timestamp, string or other types.
const toDateSafe = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date(0); // Return epoch for null/undefined to avoid crashes
  }
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'string') {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  if (typeof timestamp === 'object' && timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
  if (typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }
  console.warn("Could not parse timestamp, returning epoch:", timestamp);
  return new Date(0);
}

// This function now runs only on the server.
async function getAllAdminOrders(): Promise<Order[]> {
    const userOrdersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const reservationsQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const [userOrdersSnap, guestOrdersSnap] = await Promise.all([
        getDocs(userOrdersQuery),
        getDocs(reservationsQuery),
    ]);

    const allOrders: Order[] = [];

    userOrdersSnap.forEach(doc => {
        const orderData = doc.data() as Order;
        // IMPORTANT: Add the document path to each order object
        allOrders.push({ ...orderData, path: doc.ref.path });
    });

    guestOrdersSnap.forEach(doc => {
        const orderData = doc.data() as Order;
        if (!allOrders.some(o => o.id === orderData.id)) {
             // IMPORTANT: Add the document path to each order object
            allOrders.push({ ...orderData, path: doc.ref.path });
        }
    });
    
    allOrders.sort((a, b) => {
        const dateA = toDateSafe(a.createdAt).getTime();
        const dateB = toDateSafe(b.createdAt).getTime();
        return dateB - dateA;
    });

    // Serialize data for the client component
    return allOrders.map(order => ({
        ...order,
        createdAt: toDateSafe(order.createdAt).toISOString(),
    }));
}


export default async function AdminOrdersPage() {
  const allOrders = await getAllAdminOrders();

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
            {allOrders.length === 0 ? (
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
                    {allOrders.map((order) => (
                        <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(order.id.length - 7).toUpperCase()}</TableCell>
                        <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES') : 'N/A'}</TableCell>
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
