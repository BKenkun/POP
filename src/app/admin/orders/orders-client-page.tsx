
'use client';

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
import { Package, Eye, Loader2, AlertTriangle } from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";


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

// --- Componente de Presentación (Cliente) ---
// Responsabilidad: Obtener sus propios datos desde la API y mostrarlos.
export default function OrdersClientPage() {
  const [state, setState] = useState<{
    orders: Order[];
    loading: boolean;
    error: string | null;
  }>({
    orders: [],
    loading: true,
    error: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Al iniciar, reseteamos el estado a 'cargando'
        setState({ loading: true, orders: [], error: null });

        const response = await fetch('/api/admin/orders');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'No se pudieron cargar los pedidos.');
        }

        const data: Order[] = await response.json();
        // Datos recibidos correctamente
        setState({ loading: false, orders: data, error: null });

      } catch (error: any) {
        const errorMessage = error.message || "Ocurrió un problema al obtener los pedidos.";
        // Error capturado
        setState({ loading: false, orders: [], error: errorMessage });
        toast({
          title: "Error al Cargar Pedidos",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
    fetchOrders();
  }, [toast]);


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
            {state.loading ? (
                 <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : state.error ? (
                 <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg text-destructive">
                    <AlertTriangle className="h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">Error al Cargar los Pedidos</h3>
                    <p className="text-sm">{state.error}</p>
                </div>
            ) : state.orders.length === 0 ? (
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
                    {state.orders.map((order) => (
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
