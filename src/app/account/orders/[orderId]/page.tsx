'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Loader2, Package, ShoppingBag, MapPin, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';

const getImageUrl = (url: string) => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

export default function UserOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
        return;
    }
    if (user && orderId) {
        const orderDocRef = doc(db, 'users', user.uid, 'orders', orderId);
        const unsubscribe = onSnapshot(orderDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                 const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                setOrder({ id: docSnap.id, ...data, createdAt } as Order);
            } else {
                setOrder(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user, orderId, authLoading, router]);

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
             <h2 className="text-2xl font-bold">{t('account.order_details_not_found_title')}</h2>
             <p className="text-muted-foreground">{t('account.order_details_not_found_subtitle')}</p>
             <Button asChild variant="outline">
                <Link href="/account/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('account.order_details_back_button')}
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('account.order_details_title')}</h2>
          <p className="text-muted-foreground">
            {t('account.order_details_subtitle', { orderId: order.id.substring(order.id.length - 7).toUpperCase() })}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('account.order_details_back_button')}
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" />{t('account.order_details_items_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.productId} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                    <Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" />
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
                <CardTitle>{t('account.order_details_summary_title')}</CardTitle>
                <CardDescription>
                    {t('account.order_details_summary_date', { date: order.createdAt instanceof Date ? order.createdAt.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : t('account.date_unavailable')})}
                </CardDescription>
             </CardHeader>
             <CardContent className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('account.order_details_summary_status')}</span>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('account.order_details_summary_subtotal')}</span>
                    <span>{formatPrice(order.total)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                    <span>{t('account.order_details_summary_total')}</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
             </CardContent>
          </Card>
          
          {order.shippingAddress && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />{t('account.order_details_shipping_address_title')}</CardTitle></CardHeader>
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
