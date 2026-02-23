'use client';

import { useState, useEffect } from 'react';
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
import { Package, Eye, Loader2 } from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { db } from '@/lib/firebase';
import { collectionGroup, onSnapshot, query, orderBy } from 'firebase/firestore';


const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered':
            return 'default';
        case 'shipped':
        case 'out_for_delivery':
            return 'secondary';
        case 'pending_payment':
        case 'order_received':
            return 'outline';
        case 'cancelled':
        case 'issue':
            return 'destructive';
        default:
            return 'secondary';
    }
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'pending_payment': 'Pending Payment',
        'order_received': 'Order Received',
        'shipped': 'Shipped',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'issue': 'Issue'
    };
    return labels[status.toLowerCase()] || status;
}

export default function OrdersClientPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const q = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedOrders: Order[] = [];
          querySnapshot.forEach((doc) => {
               const data = doc.data();
               const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
               fetchedOrders.push({ id: doc.id, ...data, path: doc.ref.path, createdAt } as Order);
          });
          setOrders(fetchedOrders);
          setLoading(false);
      }, (error) => {
          console.error("Error fetching orders: ", error);
          setLoading(false);
      });
      return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Orders</h1>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Order List</CardTitle>
            <CardDescription>View and manage all orders from both users and guests.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
                    <Package className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
                    <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
                    <p className="text-muted-foreground">New orders will appear here as they arrive.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(order.id.length - 7).toUpperCase()}</TableCell>
                        <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US') : 'N/A'}</TableCell>
                        <TableCell>
                            <div>
                                {order.customerName}
                                {order.userId === 'guest' && <Badge variant="secondary" className="ml-2">Guest</Badge>}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(order.status)}>
                                {getStatusLabel(order.status)}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/orders/${order.id}?path=${encodeURIComponent(order.path || '')}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
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
