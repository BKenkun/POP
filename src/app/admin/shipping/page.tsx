'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Truck, Inbox, Phone } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/table';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';

type AdminDisplayOrder = Omit<Order, 'createdAt'> & { createdAt: string, path: string };

export default function AdminShippingPage() {
  const [shippingOrders, setShippingOrders] = useState<AdminDisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAndFilterOrders = async () => {
        setLoading(true);
        try {
            const ordersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(ordersQuery);

            const allFetchedOrders: AdminDisplayOrder[] = querySnapshot.docs.map(doc => {
                const data = doc.data() as Order;
                const createdAtISO = data.createdAt instanceof Timestamp 
                    ? data.createdAt.toDate().toISOString() 
                    : new Date().toISOString();

                return {
                    ...data,
                    id: doc.id,
                    path: doc.ref.path,
                    createdAt: createdAtISO,
                };
            });
            
            const filtered = allFetchedOrders.filter(order => order.status === 'out_for_delivery');
            setShippingOrders(filtered);

        } catch (error: any) {
            console.error("Error fetching shipping orders:", error);
            toast({ 
              title: 'Error loading shipments', 
              description: error.message || 'Could not fetch orders out for delivery.',
              variant: 'destructive' 
            });
        } finally {
            setLoading(false);
        }
    };

    fetchAndFilterOrders();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Management</h1>
          <p className="text-muted-foreground">Monitor and manage all orders currently out for delivery.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Out for Delivery ({shippingOrders.length})</CardTitle>
            <CardDescription>List of all packages that have left the warehouse.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg bg-secondary/50">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">Loading shipments...</h3>
                </div>
            ) : shippingOrders.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
                    <Inbox className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
                    <h3 className="mt-4 text-lg font-semibold">No orders out for delivery</h3>
                    <p className="text-muted-foreground">When an order is marked as "Out for Delivery", it will appear here.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Order No.</TableHead>
                        <TableHead>Departure Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {shippingOrders.map((order) => (
                        <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(order.id.length - 7).toUpperCase()}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('en-US')}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground flex items-center gap-2">
                             <Phone className="h-4 w-4" />
                            {order.shippingAddress?.phone || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {order.shippingAddress ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}` : 'Not available'}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="default" size="sm">
                                <Link href={`/admin/shipping/${order.id}?path=${encodeURIComponent(order.path)}`}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Manage Delivery
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
