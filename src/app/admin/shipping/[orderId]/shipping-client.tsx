
'use client';

import { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, Phone, Mail, Package, User, FileSignature, Save, Loader2, ArrowLeft, PenLine, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ShippingClientProps {
  initialOrder: Order;
}

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
};

export default function ShippingClient({ initialOrder }: ShippingClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isSaving, setIsSaving] = useState(false);
  const [dni, setDni] = useState(order.deliveryDni || '');
  const sigCanvas = useRef<SignatureCanvas>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    if (order.status === 'Reserva Recibida' || order.status === 'Pago Pendiente de Verificación') {
        handleStatusChange('En Reparto');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order.path) return;
    setIsSaving(true);
    try {
        const docRef = doc(firestore, order.path);
        await updateDoc(docRef, { status: newStatus });
        setOrder(prev => ({...prev, status: newStatus}));
        toast({ title: "Estado actualizado", description: `El pedido ahora está: ${newStatus}`});
    } catch (error) {
        console.error("Error updating status:", error);
        toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive"});
    } finally {
        setIsSaving(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order.path) return;
    if (sigCanvas.current?.isEmpty()) {
        toast({ title: "Falta la firma", description: "El cliente debe firmar para confirmar la entrega.", variant: "destructive" });
        return;
    }
    
    setIsSaving(true);
    const signatureDataUrl = sigCanvas.current.toDataURL('image/png');

    try {
        const docRef = doc(firestore, order.path);
        await updateDoc(docRef, { 
            status: 'Entregado',
            deliveryDni: dni,
            deliverySignature: signatureDataUrl,
        });

        setOrder(prev => ({...prev, status: 'Entregado', deliveryDni: dni, deliverySignature: signatureDataUrl }));
        toast({ title: "¡Entrega Confirmada!", description: "El pedido ha sido marcado como entregado."});
    } catch (error) {
        console.error("Error confirming delivery:", error);
        toast({ title: "Error", description: "No se pudo guardar la confirmación de entrega.", variant: "destructive"});
    } finally {
        setIsSaving(false);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const isDeliveryConfirmed = order.status === 'Entregado';
  const showDeliveryConfirmation = order.status === 'En Reparto' || isDeliveryConfirmed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Envío</h1>
          <p className="text-muted-foreground">Pedido #{order.id.substring(order.id.length - 7).toUpperCase()}</p>
        </div>
         <Button asChild variant="outline">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
          </Link>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

        {/* Columna Izquierda: Datos Cliente y Paquete */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User/>Datos del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p className="font-bold text-base">{order.customerName}</p>
                    <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-2 text-primary hover:underline"><Mail className="h-4 w-4"/> {order.customerEmail}</a>
                    {order.shippingAddress?.phone && <a href={`tel:${order.shippingAddress.phone}`} className="flex items-center gap-2 text-primary hover:underline"><Phone className="h-4 w-4"/> {order.shippingAddress.phone}</a>}
                </CardContent>
            </Card>

            {order.shippingAddress && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><MapPin/>Dirección de Envío</CardTitle></CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <address className="not-italic">
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>{order.shippingAddress.postal_code} {order.shippingAddress.city}</p>
                            <p>{order.shippingAddress.state}, {order.shippingAddress.country}</p>
                        </address>
                        <Button asChild variant="outline" className="w-full mt-4">
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shippingAddress.line1}, ${order.shippingAddress.city}`)}`} target="_blank" rel="noopener noreferrer">
                                Abrir en Google Maps
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package/>Contenido del Paquete</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        {order.items.map(item => (
                            <li key={item.productId} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <Badge variant="secondary">x {item.quantity}</Badge>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>

        {/* Columna Derecha: Estado y Firma */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Truck/>Gestión de Estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold">Estado actual:</span>
                        <Badge variant={getStatusVariant(order.status)} className="text-base">{order.status}</Badge>
                    </div>
                     <Select onValueChange={(val) => handleStatusChange(val as Order['status'])} defaultValue={order.status} disabled={isSaving || isDeliveryConfirmed}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cambiar estado..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En Reparto">En Reparto</SelectItem>
                        <SelectItem value="Incidencia">Incidencia</SelectItem>
                        <SelectItem value="Entregado">Entregado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    {isSaving && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Guardando...</div>}
                </CardContent>
            </Card>

            {showDeliveryConfirmation && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileSignature/>Confirmación de Entrega</CardTitle>
                        <CardDescription>
                            {isDeliveryConfirmed ? "La entrega fue confirmada y firmada." : "Recoge el DNI y la firma del receptor para confirmar la entrega."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="dni">DNI del Receptor (Opcional)</Label>
                            <Input id="dni" value={dni} onChange={e => setDni(e.target.value)} placeholder="12345678A" disabled={isDeliveryConfirmed || isSaving}/>
                        </div>
                        <div>
                             <Label>Firma del Receptor</Label>
                             {isDeliveryConfirmed && order.deliverySignature ? (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Firma guardada:</p>
                                    <div className="border rounded-md p-2 bg-muted/50">
                                         {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={order.deliverySignature} alt="Firma de entrega" className="mx-auto" />
                                    </div>
                                </div>
                             ) : (
                                <div className="relative border rounded-md">
                                    <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-40'}} />
                                    <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-7 w-7" onClick={clearSignature} disabled={isSaving}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                             )}
                        </div>
                        {!isDeliveryConfirmed && (
                             <Button size="lg" className="w-full" onClick={handleConfirmDelivery} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                                {isSaving ? 'Guardando Confirmación...' : 'Confirmar Entrega y Guardar'}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
