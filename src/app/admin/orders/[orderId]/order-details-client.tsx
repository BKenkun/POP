'use client';

import { useState } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, ArrowLeft, Loader2, Save, MapPin, Truck, History, MessageSquare, Phone, User as UserIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';


const getImageUrl = (url: string) => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'delivered':
            return 'default';
        case 'shipped':
        case 'out_for_delivery':
            return 'secondary';
        case 'order_received':
        case 'pending_payment':
            return 'outline';
        case 'cancelled':
        case 'issue':
            return 'destructive';
        default:
            return 'secondary';
    }
}


export default function OrderDetailsClient({ initialOrder }: { initialOrder: Order }) {
  const [order, setOrder] = useState(initialOrder);
  const [isSaving, setIsSaving] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusChange = (newStatus: OrderStatus) => {
    setOrder(prev => ({ ...prev, status: newStatus }));
  };

  const handleSaveChanges = async () => {
    if (!order.path) {
        toast({ title: 'Error', description: 'Cannot save order. Path not found.', variant: 'destructive'});
        return;
    }
    setIsSaving(true);
    
    try {
      const orderDocRef = doc(db, order.path);
      await updateDoc(orderDocRef, {
        status: order.status,
      });

      await trackOrderStatusUpdate(order, order.status);

      toast({
        title: 'Order Updated',
        description: `Order #${order.id.substring(order.id.length - 7)} status updated to "${order.status}".`,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({ title: 'Error', description: 'Could not update order.', variant: 'destructive' });
      setOrder(initialOrder);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShipping = async () => {
    if (!order.path) {
      toast({ title: 'Error', description: 'Cannot ship order. Path not found.', variant: 'destructive' });
      return;
    }
    setIsShipping(true);
    try {
      const newStatus = 'out_for_delivery';
      const orderDocRef = doc(db, order.path);
      await updateDoc(orderDocRef, { status: newStatus });
      
      await trackOrderStatusUpdate({ ...order, status: newStatus }, newStatus);

      toast({ title: 'Order on its way', description: 'Order marked as "Out for Delivery".' });
      router.push(`/admin/shipping/${order.id}?path=${encodeURIComponent(order.path)}`);
    } catch (error) {
      console.error('Error setting order to shipping:', error);
      toast({ title: 'Error', description: 'Could not set order to shipping.', variant: 'destructive' });
    } finally {
      setIsShipping(false);
    }
  };
  
  const hasChanges = order.status !== initialOrder.status;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id.substring(order.id.length - 7)}</h1>
           <p className="text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
        </div>
        <div className="flex items-center gap-2">
           <Button asChild variant="outline">
                <Link href="/admin/orders">
                    <ArrowLeft className="mr-2" />
                    Back
                </Link>
            </Button>
            <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                Save Changes
            </Button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Order Summary</span>
                        <Badge variant={getStatusVariant(order.status)} className="text-base uppercase">
                            {order.status.replace('_', ' ')}
                        </Badge>
                    </CardTitle>
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
                     <Separator className="my-4" />
                     <div className="space-y-2 text-right">
                         <div className="flex justify-end gap-4">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                         <div className="flex justify-end gap-4 font-bold text-lg">
                            <span>TOTAL:</span>
                            <span className="text-primary">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />History and Notes</CardTitle>
                </CardHeader>
                <CardContent>
                     <Textarea placeholder="Add internal note about the order..." />
                     <Button variant="outline" size="sm" className="mt-2">Add Note</Button>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Order Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Select value={order.status} onValueChange={(value: OrderStatus) => handleStatusChange(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Change status..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="order_received">Order Received</SelectItem>
                            <SelectItem value="pending_payment">Pending Payment</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                             <SelectItem value="issue">Issue</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button className="w-full" onClick={handleShipping} disabled={isShipping}>
                        {isShipping ? <Loader2 className="mr-2 animate-spin" /> : <Truck className="mr-2" />}
                        {isShipping ? 'Shipping...' : 'Manage Delivery'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5" />Customer Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p className="font-semibold text-base">{order.customerName}</p>
                    <a href={`mailto:${order.customerEmail}`} className="text-primary hover:underline flex items-center gap-2"><MessageSquare className="h-4 w-4"/>{order.customerEmail}</a>
                    <a href={`tel:${order.shippingAddress?.phone}`} className="text-primary hover:underline flex items-center gap-2"><Phone className="h-4 w-4"/>{order.shippingAddress?.phone || 'Not available'}</a>
                </CardContent>
            </Card>

            {order.shippingAddress && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Shipping Address</CardTitle></CardHeader>
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
