
'use client';

import { useState } from 'react';
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

// --- Componente de Presentación (Cliente) ---
// Responsabilidad: Mostrar los datos del pedido y gestionar la actualización de estado.
// No tiene lógica de obtención de datos.
export default function OrderDetailsClient({ initialOrder }: { initialOrder: Order }) {
  const { toast } = useToast();
  
  // El estado local se inicializa desde las props.
  const [order, setOrder] = useState<Order>(initialOrder);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
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
        // Actualiza el estado local para reflejar el cambio inmediatamente en la UI
        setOrder(prev => ({...prev, status: newStatus as Order['status']}));
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
