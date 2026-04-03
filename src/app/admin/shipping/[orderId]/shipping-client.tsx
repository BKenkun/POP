'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, notFound, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, MapPin, Truck, Check, AlertCircle, Package } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import SignatureCanvas from 'react-signature-canvas';
import { Input } from '@/components/ui/input';

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

export default function ShippingClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const orderPath = searchParams.get('path');
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dni, setDni] = useState('');
  
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (!orderPath) {
      if (orderId && !orderPath) {
        setOrder(null);
        setLoading(false);
      }
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const orderDocRef = doc(db, decodeURIComponent(orderPath));
        const docSnap = await getDoc(orderDocRef);
        if (docSnap.exists()) {
          const orderData = docSnap.data() as Omit<Order, 'id'>;
          let createdAtDate: Date;
          if (orderData.createdAt && (orderData.createdAt as any).toDate) {
              createdAtDate = (orderData.createdAt as any).toDate();
          } else if (orderData.createdAt instanceof Date) {
              createdAtDate = orderData.createdAt;
          } else {
              createdAtDate = new Date(orderData.createdAt as any);
          }
          
          setOrder({ ...orderData, id: docSnap.id, path: docSnap.ref.path, createdAt: createdAtDate } as Order);
          setDni(orderData.deliveryDni || '');
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, orderPath]);
  
  const clearSignature = () => sigCanvas.current?.clear();

  const handleDeliveryConfirmation = async (status: 'delivered' | 'issue') => {
    if (!order?.path) return;
    
    if (status === 'delivered' && (!dni.trim() || sigCanvas.current?.isEmpty())) {
        toast({ title: 'Missing information', description: 'ID and Signature are required to confirm delivery.', variant: 'destructive'});
        return;
    }

    setIsSaving(true);
    try {
        const orderDocRef = doc(db, order.path);
        
        let signatureDataUrl = order.deliverySignature || null;
        if(status === 'delivered' && sigCanvas.current && !sigCanvas.current.isEmpty()){
            signatureDataUrl = sigCanvas.current.toDataURL('image/png');
        }

        await updateDoc(orderDocRef, {
            status,
            deliveryDni: dni,
            deliverySignature: signatureDataUrl,
            updatedAt: Timestamp.now(),
        });

        setOrder(prev => prev ? { ...prev, status, deliveryDni: dni, deliverySignature: signatureDataUrl } : null);
        toast({ title: 'Order updated', description: `Status changed to "${status}".` });
        
    } catch (error) {
        console.error("Error updating order:", error);
        toast({ title: 'Error', description: 'Could not update order status.', variant: 'destructive'});
    } finally {
        setIsSaving(false);
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center h-60"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!order) {
    return notFound();
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold">Manage Delivery</h1>
            <p className="text-muted-foreground">Order #{order.id.substring(order.id.length-7).toUpperCase()}</p>
         </div>
        <Button asChild variant="outline"><Link href="/admin/shipping"><ArrowLeft className="mr-2" />Back to Shipments</Link></Button>
      </div>

       <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package/>Package Content</CardTitle></CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.productId} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                    <Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                                </div>
                                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Delivery Confirmation</CardTitle>
                    <CardDescription>Complete this section to register the delivery.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="dni" className="font-medium text-sm">Recipient ID (DNI/Passport)</label>
                        <Input id="dni" placeholder="Enter ID of person receiving" value={dni} onChange={(e) => setDni(e.target.value)} className="mt-1"/>
                    </div>
                     <div>
                        <label className="font-medium text-sm">Recipient Signature</label>
                         <div className="mt-1 border rounded-md bg-background">
                            <SignatureCanvas 
                                ref={sigCanvas} 
                                penColor='black' 
                                canvasProps={{ className: 'w-full h-40' }}
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearSignature} className="mt-1">Clear signature</Button>
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end gap-2">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isSaving}><AlertCircle className="mr-2"/>Mark Issue</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Issue?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will mark the order as "Issue". Use if the address is wrong, delivery refused, etc.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeliveryConfirmation('issue')}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={isSaving}><Check className="mr-2"/>Mark Delivered</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Delivery?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Make sure you have collected ID and signature. This action is final.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeliveryConfirmation('delivered')}>Confirm Delivery</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 </CardFooter>
            </Card>

        </div>
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant={getStatusVariant(order.status)} className="text-base uppercase">{order.status.replace('_', ' ')}</Badge>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin/>Shipping Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p className="font-medium text-base">{order.customerName}</p>
                    {order.shippingAddress && (
                        <>
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>{order.shippingAddress.postal_code} {order.shippingAddress.city}</p>
                            <p>{order.shippingAddress.state}, {order.shippingAddress.country}</p>
                            <p className="pt-2"><strong>Contact:</strong> {order.shippingAddress.phone}</p>
                        </>
                    )}
                </CardContent>
             </Card>
             
              {order.deliverySignature && (
                 <Card>
                    <CardHeader><CardTitle>Delivery Signature</CardTitle></CardHeader>
                    <CardContent>
                        <div className="border rounded-md p-2 bg-white">
                            <Image src={order.deliverySignature} alt="Delivery signature" width={300} height={150} style={{ width: '100%', height: 'auto' }}/>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">ID: {order.deliveryDni}</p>
                    </CardContent>
                 </Card>
             )}
        </div>
      </div>
    </div>
  );
}
