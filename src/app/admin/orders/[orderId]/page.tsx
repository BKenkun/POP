'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { updateOrderStatus } from '@/app/actions/admin-data';
import { Order } from '@/lib/types';
import { Loader2, Package, User, MapPin, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, collectionGroup, query, where, getDocs } from 'firebase/firestore';


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
   if (typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }
  console.warn("Could not parse timestamp, returning epoch:", timestamp);
  return new Date(0);
}


// This function is now a server action. It fetches the order and returns a PLAIN object.
async function getAdminOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) return null;

    let order: Order | null = null;
    let path: string | null = null;

    // Search in 'orders' collection group first
    const ordersQuery = query(collectionGroup(db, 'orders'), where('id', '==', orderId));
    const orderSnap = await getDocs(ordersQuery);
    
    if (!orderSnap.empty) {
        // Found in a user's subcollection
        path = orderSnap.docs[0].ref.path;
        const docSnap = await getDoc(orderSnap.docs[0].ref);
        if (docSnap.exists()) {
             order = docSnap.data() as Order;
             order.path = path;
        }
    } else {
        // If not found, check the 'reservations' collection for guest orders
        const reservationRef = doc(db, 'reservations', orderId);
        const reservationSnap = await getDoc(reservationRef);
        if (reservationSnap.exists()) {
            order = reservationSnap.data() as Order;
            order.path = reservationRef.path;
        }
    }

    if (order) {
        // Convert to a plain JavaScript object and ensure date is a string
        return {
            ...order,
            createdAt: toDateSafe(order.createdAt).toISOString(),
        } as Order;
    }

    return null;
}


export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  useEffect(() => {
    if (!orderId) return;

    const findOrder = async () => {
        setLoading(true);
        try {
            // Because this is a client component, we call the server action to get the data
            const fetchedOrder = await getAdminOrderById(orderId);
            if (fetchedOrder) {
                setOrder(fetchedOrder);
            } else {
                setOrder(null);
                toast({ title: "Error", description: "Pedido no encontrado.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
            toast({ title: "Error", description: "No se pudieron cargar los detalles del pedido.", variant: "destructive"});
        } finally {
            setLoading(false);
        }
    };
    findOrder();
  }, [orderId, toast]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !order.path) {
        toast({ title: "Error", description: "No se puede encontrar la referencia del pedido para actualizar.", variant: 'destructive'});
        return;
    }
    setUpdatingStatus(true);
    
    const result = await updateOrderStatus(order.path, newStatus);
    
    if (result.success) {
      toast({
            title: "Estado del pedido actualizado",
            description: `El pedido ahora está marcado como "${newStatus}".`,
        });
        setOrder(prev => prev ? {...prev, status: newStatus as Order['status']} : null);
    } else {
       toast({ title: "Error", description: result.error || "No se pudo actualizar el estado.", variant: 'destructive'});
    }
    
    setUpdatingStatus(false);
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
  };

  if (loading) {
    return <div className="flex justify-center items-center h-60"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!order) {
    return <div className="text-center">Pedido no encontrado.</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedido #{order.id.substring(order.id.length - 7).toUpperCase()}</h1>
          <p className="text-muted-foreground">
            Realizado el {new Date(order.createdAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Resumen del Pedido</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {order.items.map(item => (
                        <div key={item.productId} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(item.price)}</p>
                            </div>
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                    ))}
                    <Separator />
                    <div className="flex justify-end">
                        <div className="text-right">
                            <p className="text-muted-foreground">Subtotal <span className="font-medium text-foreground ml-2">{formatPrice(order.total)}</span></p>
                             <p className="font-bold text-lg">TOTAL <span className="text-primary ml-2">{formatPrice(order.total)}</span></p>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card>
            <CardHeader><CardTitle>Estado del Pedido</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <Badge variant={getStatusVariant(order.status)} className="text-base">{order.status}</Badge>
                
                <Select onValueChange={handleStatusChange} defaultValue={order.status} disabled={updatingStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cambiar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reserva Recibida">Reserva Recibida</SelectItem>
                    <SelectItem value="Pago Pendiente de Verificación">Pago Pendiente</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="Entregado">Entregado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                 {updatingStatus && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Actualizando...</p>}
            </CardContent>
          </Card>
          <Card>
             <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Cliente</CardTitle></CardHeader>
             <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
                {order.userId === 'guest' && <Badge variant="secondary">Invitado</Badge>}
             </CardContent>
          </Card>
          {order.shippingAddress && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Dirección de Envío</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>{order.shippingAddress.postal_code} {order.shippingAddress.city}</p>
                    <p>{order.shippingAddress.state}, {order.shippingAddress.country}</p>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
    </div>
  );
}
