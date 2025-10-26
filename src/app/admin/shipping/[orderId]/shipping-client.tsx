
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, notFound, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, ArrowLeft, Loader2, Save, MapPin, Truck, Check, Edit, AlertCircle, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
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
    switch (status.toLowerCase()) {
        case 'delivered':
        case 'entregado':
            return 'default';
        case 'shipped':
        case 'enviado':
        case 'en reparto':
            return 'secondary';
        case 'pending':
        case 'pendiente':
        case 'reserva recibida':
        case 'pago pendiente de verificación':
            return 'outline';
        case 'cancelled':
        case 'cancelado':
        case 'incidencia':
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
          const createdAt = orderData.createdAt && (orderData.createdAt as any).toDate 
            ? (orderData.createdAt as any).toDate().toISOString()
            : new Date().toISOString();
          setOrder({ ...orderData, id: docSnap.id, path: docSnap.ref.path, createdAt } as Order);
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

  const handleDeliveryConfirmation = async (status: 'Entregado' | 'Incidencia') => {
    if (!order?.path) return;
    
    if (status === 'Entregado' && (!dni.trim() || sigCanvas.current?.isEmpty())) {
        toast({ title: 'Faltan datos', description: 'El DNI y la firma son obligatorios para confirmar la entrega.', variant: 'destructive'});
        return;
    }

    setIsSaving(true);
    try {
        const orderDocRef = doc(db, order.path);
        
        let signatureDataUrl = order.deliverySignature || null;
        if(status === 'Entregado' && sigCanvas.current && !sigCanvas.current.isEmpty()){
            signatureDataUrl = sigCanvas.current.toDataURL('image/png');
        }

        await updateDoc(orderDocRef, {
            status,
            deliveryDni: dni,
            deliverySignature: signatureDataUrl,
            updatedAt: Timestamp.now(),
        });

        setOrder(prev => prev ? { ...prev, status, deliveryDni: dni, deliverySignature: signatureDataUrl } : null);
        toast({ title: 'Pedido actualizado', description: `El estado del pedido se ha marcado como "${status}".` });
        
    } catch (error) {
        console.error("Error updating order:", error);
        toast({ title: 'Error', description: 'No se pudo actualizar el estado del pedido.', variant: 'destructive'});
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
            <h1 className="text-3xl font-bold">Gestionar Entrega</h1>
            <p className="text-muted-foreground">Pedido #{order.id.substring(order.id.length-7)}</p>
         </div>
        <Button asChild variant="outline"><Link href="/admin/shipping"><ArrowLeft className="mr-2" />Volver a Envíos</Link></Button>
      </div>

       <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package/>Contenido del Paquete</CardTitle></CardHeader>
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
                    <CardTitle className="flex items-center gap-2">Confirmación de Entrega</CardTitle>
                    <CardDescription>Completa esta sección para registrar la entrega al cliente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="dni" className="font-medium text-sm">DNI del Receptor</label>
                        <Input id="dni" placeholder="Introduce el DNI de quien recibe" value={dni} onChange={(e) => setDni(e.target.value)} className="mt-1"/>
                    </div>
                     <div>
                        <label className="font-medium text-sm">Firma del Receptor</label>
                         <div className="mt-1 border rounded-md bg-background">
                            <SignatureCanvas 
                                ref={sigCanvas} 
                                penColor='black' 
                                canvasProps={{ className: 'w-full h-40' }}
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearSignature} className="mt-1">Limpiar firma</Button>
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end gap-2">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isSaving}><AlertCircle className="mr-2"/>Marcar Incidencia</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmar Incidencia?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esto marcará el pedido con estado "Incidencia". Úsalo si el cliente rechaza el paquete, la dirección es incorrecta, etc.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeliveryConfirmation('Incidencia')}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={isSaving}><Check className="mr-2"/>Marcar como Entregado</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmar Entrega?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Asegúrate de haber recogido la firma y el DNI. Esta acción es definitiva.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeliveryConfirmation('Entregado')}>Confirmar Entrega</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 </CardFooter>
            </Card>

        </div>
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Estado Actual</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant={getStatusVariant(order.status)} className="text-base">{order.status}</Badge>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin/>Datos de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p className="font-medium text-base">{order.customerName}</p>
                    {order.shippingAddress && (
                        <>
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>{order.shippingAddress.postal_code} {order.shippingAddress.city}</p>
                            <p>{order.shippingAddress.state}, {order.shippingAddress.country}</p>
                            <p className="pt-2"><strong>Contacto:</strong> {order.shippingAddress.phone}</p>
                        </>
                    )}
                </CardContent>
             </Card>
             
              {order.deliverySignature && (
                 <Card>
                    <CardHeader><CardTitle>Firma de Entrega</CardTitle></CardHeader>
                    <CardContent>
                        <div className="border rounded-md p-2 bg-white">
                            <Image src={order.deliverySignature} alt="Firma de entrega" width={300} height={150} style={{ width: '100%', height: 'auto' }}/>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">DNI: {order.deliveryDni}</p>
                    </CardContent>
                 </Card>
             )}
        </div>
      </div>
    </div>
  );
}
