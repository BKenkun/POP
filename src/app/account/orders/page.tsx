'use client';

import { useAuth, useTranslation } from "@/context";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button } from "@/components"
import { Loader2, ShoppingBag, Eye } from "lucide-react";
import { Order } from "@/schemas";
import { formatPrice } from "@/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { getStatusVariant } from "@/types";

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const ordersQuery = query(
        collection(db, 'users', user.uid, 'orders'), 
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
            fetchedOrders.push({ id: doc.id, ...data, createdAt } as Order);
        });
        setOrders(fetchedOrders);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <div className="space-y-6">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">{t('account.orders_title')}</h2>
            <p className="text-muted-foreground">
                {t('account.orders_subtitle')}
            </p>
        </div>
        
        {!orders || orders.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-center border-dashed border-2 rounded-lg">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
                <h3 className="mt-4 text-lg font-semibold">{t('account.orders_empty_title')}</h3>
                <p className="text-muted-foreground">{t('account.orders_empty_subtitle')}</p>
            </div>
        ) : (
             <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>{t('account.orders_table_order_no')}</TableHead>
                    <TableHead>{t('account.orders_table_date')}</TableHead>
                    <TableHead>{t('account.orders_table_status')}</TableHead>
                    <TableHead className="text-right">{t('account.orders_table_total')}</TableHead>
                    <TableHead className="text-right">{t('account.orders_table_actions')}</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(order.id.length - 7)}</TableCell>
                    <TableCell>{order.createdAt instanceof Date ? order.createdAt.toLocaleDateString('es-ES') : t('account.invalid_date')}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/account/orders/${order.id}`}>
                             {/* FIXME - esto tiene pinta de un navigation o algo parecido */}
                                <Eye className="mr-2 h-4 w-4" />
                                {t('account.orders_view_details_button')}
                            </Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        )}
    </div>
  )
}
