'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2, Ticket, Truck } from 'lucide-react';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minPurchase?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  onePerUser?: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const fetchedCoupons: Coupon[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Coupon));
      setCoupons(fetchedCoupons);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleActive = async (coupon: Coupon) => {
    const couponRef = doc(db, 'coupons', coupon.id);
    try {
      await updateDoc(couponRef, { isActive: !coupon.isActive });
      toast({
        title: 'Cupón actualizado',
        description: `El estado de "${coupon.code}" ha sido cambiado.`,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el cupón.', variant: 'destructive' });
    }
  };
  
  const handleDeleteCoupon = async (couponId: string) => {
    const couponRef = doc(db, 'coupons', couponId);
    try {
        await deleteDoc(couponRef);
        toast({ title: 'Cupón Eliminado', description: 'El cupón ha sido eliminado permanentemente.', variant: 'destructive'});
    } catch (error) {
        toast({ title: 'Error', description: 'No se pudo eliminar el cupón.', variant: 'destructive'});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cupones</h1>
          <p className="text-muted-foreground">Crea y administra códigos de descuento y envío gratis para tus clientes.</p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Cupón
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Cupones</CardTitle>
          <CardDescription>Aquí puedes ver y gestionar todos los cupones activos, porcentaje, cantidad fija o envío gratis.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : coupons.length === 0 ? (
                 <div className="text-center py-12 border-dashed border-2 rounded-lg">
                    <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Aún no hay cupones</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Crea tu primer cupón para empezar a ofrecer descuentos o envío gratis.</p>
                    <Button asChild className="mt-4">
                        <Link href="/admin/coupons/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Cupón
                        </Link>
                    </Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Tipo / Valor</TableHead>
                        <TableHead>Usos</TableHead>
                        <TableHead>Compra Mínima</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                            <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                            <TableCell className="text-muted-foreground">{coupon.description}</TableCell>
                            <TableCell>
                            {coupon.discountType === 'free_shipping' ? (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium">
                                    <Truck className="h-3 w-3" /> Envío Gratis
                                </Badge>
                            ) : coupon.discountType === 'percentage' ? (
                                <Badge variant="secondary" className="font-semibold">{coupon.discountValue}%</Badge>
                            ) : (
                                <Badge variant="secondary" className="font-semibold">{formatPrice(coupon.discountValue)}</Badge>
                            )}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="text-sm">
                                        {coupon.usageLimit === 1 ? (
                                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                1 uso único ({coupon.usageCount || 0}/1)
                                            </span>
                                        ) : coupon.usageLimit && coupon.usageLimit > 1 ? (
                                            <span>{coupon.usageCount || 0} / {coupon.usageLimit}</span>
                                        ) : (
                                            <span>{coupon.usageCount || 0} <span className="text-muted-foreground text-xs">(Ilimitado)</span></span>
                                        )}
                                    </div>
                                    {coupon.onePerUser && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/40 text-blue-600 dark:text-blue-400">
                                            1 por cliente
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {coupon.minPurchase && coupon.minPurchase > 0 ? formatPrice(coupon.minPurchase) : 'Sin mínimo'}
                            </TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                                <Switch
                                checked={coupon.isActive}
                                onCheckedChange={() => handleToggleActive(coupon)}
                                />
                                <Badge variant={coupon.isActive ? 'default' : 'outline'}>
                                {coupon.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                            </TableCell>
                            <TableCell className="text-right">
                            <AlertDialog>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/coupons/edit/${coupon.id}`}><Edit className="mr-2 h-4 w-4"/>Editar</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Eliminar</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                     <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará permanentemente este cupón.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                            Sí, eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
