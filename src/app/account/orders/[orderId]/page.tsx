
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Loader2, Package, ShoppingBag, MapPin, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  
  const orderDocRef = useMemoFirebase(() => {
    // A user can only view their own order
    if (!user || !orderId || !firestore) return null;
    // **FIX**: The document is now in the user's subcollection
    return doc(firestore, 'users', user.uid, 'orders', orderId);
  }, [user, orderId, firestore]);
  
  const { data: order, isLoading } = useDoc<Order>(orderDocRef);

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login'); // Redirect if not logged in
    }
  }, [user, authLoading, router]);
  
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

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!order) {
    return (
        <div className="text-center space-y-4">
             <h2 className="text-2xl font-bold">Pedido no encontrado</h2>
             <p className="text-muted-foreground">No hemos podido encontrar este pedido o no tienes permiso para verlo.</p>
             <Button asChild variant="outline">
                <Link href="/account/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Mis Pedidos
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Detalles del Pedido</h2>
          <p className="text-muted-foreground">
            Pedido #{order.id.substring(order.id.length - 7).toUpperCase()}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" />Artículos del Pedido</CardTitle>
                </CardHeader>
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
                    </div>
                </CardContent>
              </Card>
          </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <Card>
             <CardHeader>
                <CardTitle>Resumen</CardTitle>
                <CardDescription>
                    Realizado el {order.createdAt instanceof Date ? order.createdAt.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : 'Fecha no disponible'}
                </CardDescription>
             </CardHeader>
             <CardContent className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado del pedido:</span>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatPrice(order.total)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL:</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
             </CardContent>
          </Card>
          
          {order.shippingAddress && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Dirección de Envío</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p className="font-medium">{order.customerName}</p>
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

    