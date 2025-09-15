
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Loader2, Package, User, MapPin, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for user auth to resolve
    if (!user) {
        router.push('/login'); // Redirect if not logged in
        return;
    }
    if (!orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      const orderDocRef = doc(db, 'users', user.uid, 'orders', orderId);
      const docSnap = await getDoc(orderDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrder({
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Order);
      } else {
        // Order not found or doesn't belong to this user
        setOrder(null);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, user, authLoading, router]);
  
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
  };

  if (loading || authLoading) {
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
                    Realizado el {new Date(order.createdAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
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

