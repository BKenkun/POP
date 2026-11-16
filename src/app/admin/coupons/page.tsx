'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
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
import { useAuth } from '@/context/auth-context';
import {
  listAdminCoupons,
  updateAdminCoupon,
  deleteAdminCoupon,
} from '@/app/actions/coupons-admin';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2, Ticket, Truck } from 'lucide-react';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minPurchase?: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  onePerUser?: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadCouponsFromServer = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const idToken = await user.getIdToken();
      const serverCoupons = await listAdminCoupons(idToken);
      setCoupons(serverCoupons);
    } catch (err) {
      console.warn('Notice loading coupons via server action:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadCouponsFromServer();

    const unsubscribe = onSnapshot(
      collection(db, 'coupons'),
      (snapshot) => {
        const fetchedCoupons: Coupon[] = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            } as Coupon)
        );
        if (fetchedCoupons.length > 0) {
          setCoupons(fetchedCoupons);
        }
        setLoading(false);
      },
      () => {
        // Si las reglas cliente restringen la lectura directa, mantenemos los datos obtenidos por servidor
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [loadCouponsFromServer]);

  const handleToggleActive = async (coupon: Coupon) => {
    if (!user) return;
    const nextState = !coupon.isActive;
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, isActive: nextState } : c))
    );

    try {
      const idToken = await user.getIdToken();
      const res = await updateAdminCoupon(coupon.id, { isActive: nextState }, idToken);
      if (!res.success) {
        throw new Error(res.error || 'Could not update coupon.');
      }
      toast({
        title: 'Coupon Updated',
        description: `Status of "${coupon.code}" has been updated.`,
      });
    } catch (error) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c))
      );
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not update coupon.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteCoupon = async (couponId: string) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await deleteAdminCoupon(couponId, idToken);
      if (!res.success) {
        throw new Error(res.error || 'Could not delete coupon.');
      }
      setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      toast({
        title: 'Coupon Deleted',
        description: 'Coupon has been permanently deleted.',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not delete coupon.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage promo codes and free shipping coupons for your customers.</p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Coupon
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupons List</CardTitle>
          <CardDescription>View and manage all active coupons: percentage, fixed discounts, or free shipping.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : coupons.length === 0 ? (
                 <div className="text-center py-12 border-dashed border-2 rounded-lg">
                    <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No coupons yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Create your first coupon to offer discounts or free shipping.</p>
                    <Button asChild className="mt-4">
                        <Link href="/admin/coupons/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Coupon
                        </Link>
                    </Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type / Value</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Min Purchase</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                                    <Truck className="h-3 w-3" /> Free Shipping
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
                                                Single use ({coupon.usageCount || 0}/1)
                                            </span>
                                        ) : coupon.usageLimit && coupon.usageLimit > 1 ? (
                                            <span>{coupon.usageCount || 0} / {coupon.usageLimit}</span>
                                        ) : (
                                            <span>{coupon.usageCount || 0} <span className="text-muted-foreground text-xs">(Unlimited)</span></span>
                                        )}
                                    </div>
                                    {coupon.onePerUser && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/40 text-blue-600 dark:text-blue-400">
                                            1 per customer
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {coupon.minPurchase && coupon.minPurchase > 0 ? formatPrice(coupon.minPurchase) : 'No minimum'}
                            </TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                                <Switch
                                checked={coupon.isActive}
                                onCheckedChange={() => handleToggleActive(coupon)}
                                />
                                <Badge variant={coupon.isActive ? 'default' : 'outline'}>
                                {coupon.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            </TableCell>
                            <TableCell className="text-right">
                            <AlertDialog>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/coupons/edit/${coupon.id}`}><Edit className="mr-2 h-4 w-4"/>Edit</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                     <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This coupon will be permanently removed.
                                        </AlertDialogDescription>
                                     </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                            Yes, delete
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
