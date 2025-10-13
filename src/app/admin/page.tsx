
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./_components/date-range-picker";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { cbdProducts } from "@/lib/cbd-products";
import type { Order, Product } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDays, startOfMonth } from "date-fns";

// Define a type for the user data we expect
export interface Customer {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    creationTime?: string | Timestamp; // Can be string or Timestamp
}

const StatCard = ({ title, icon: Icon, loading, children }: { title: string, icon: React.ElementType, loading: boolean, children: React.ReactNode }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <div className="space-y-1">
                        {children}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function AdminDashboardPage() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: today,
  });
  
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>();
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const firestore = useFirestore();

  // --- Data Fetching ---
  const ordersQuery = useMemoFirebase(() => query(collectionGroup(firestore, 'orders'), orderBy('createdAt', 'desc')), [firestore]);
  const { data: allOrders, isLoading: loadingOrders } = useCollection<Order>(ordersQuery);
  
  const usersQuery = useMemoFirebase(() => query(collection(firestore, 'users')), [firestore]);
  const { data: allUsers, isLoading: loadingUsers } = useCollection<Customer>(usersQuery);

  useEffect(() => {
    setProducts(cbdProducts);
    setLoadingProducts(false);
  }, []);

  const { 
      filteredOrders, 
      filteredUsers, 
      recentOrders, 
      topCustomers,
      totalRevenue,
      collectedRevenue
  } = useMemo(() => {
      if (!allOrders || !allUsers) return { filteredOrders: [], filteredUsers: [], recentOrders: [], topCustomers: [], totalRevenue: 0, collectedRevenue: 0 };

      const from = dateRange?.from;
      const to = dateRange?.to;

      const filteredOrders = allOrders.filter(order => {
          if (!from) return true;
          const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
          const toDate = to ? addDays(to, 1) : new Date(); // include the whole "to" day
          return orderDate >= from && orderDate < toDate;
      });

      const filteredUsers = allUsers.filter(user => {
          if (!from || !user.creationTime) return false;
          const userDate = user.creationTime instanceof Timestamp ? user.creationTime.toDate() : new Date(user.creationTime);
          const toDate = to ? addDays(to, 1) : new Date();
          return userDate >= from && userDate < toDate;
      });

      const recentOrders = allOrders.slice(0, 5);
      
      const customerSpending = allOrders.reduce((acc, order) => {
          if (!order.userId || order.userId === 'guest') return acc;
          if (!acc[order.userId]) {
              acc[order.userId] = { userId: order.userId, name: order.customerName, email: order.customerEmail, total: 0, count: 0 };
          }
          acc[order.userId].total += order.total;
          acc[order.userId].count += 1;
          // Use the name from the latest order in case it was updated
          acc[order.userId].name = order.customerName;
          return acc;
      }, {} as Record<string, { userId: string, name: string, email: string, total: number, count: number }>);
      
      const topCustomers = Object.values(customerSpending).sort((a, b) => b.total - a.total).slice(0, 5);
      
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const collectedRevenue = filteredOrders
        .filter(order => order.status === 'Entregado')
        .reduce((sum, order) => sum + order.total, 0);


      return { filteredOrders, filteredUsers, recentOrders, topCustomers, totalRevenue, collectedRevenue };
  }, [allOrders, allUsers, dateRange]);


  const totalOrders = filteredOrders.length;
  const newCustomers = filteredUsers.length;
  const lowStockCount = products.filter(p => p.stock !== undefined && p.stock <= 5).length;
  const loadingStats = loadingOrders || loadingUsers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu tienda.</p>
        </div>
         <div className="flex items-center gap-2">
            <DateRangePicker 
                date={dateRange} 
                setDate={setDateRange}
                compareDate={compareDateRange}
                setCompareDate={setCompareDateRange}
                isCompareEnabled={isCompareEnabled}
                setIsCompareEnabled={setIsCompareEnabled}
            />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Ingresos" icon={DollarSign} loading={loadingStats}>
             <div className="text-2xl font-bold">{formatPrice(collectedRevenue)}</div>
             <p className="text-xs text-muted-foreground">
                <span className="font-semibold">{formatPrice(totalRevenue)}</span> proyectados
             </p>
          </StatCard>

          <StatCard title="Pedidos" icon={ShoppingCart} loading={loadingStats}>
             <div className="text-2xl font-bold">{totalOrders.toLocaleString('es-ES')}</div>
             <p className="text-xs text-muted-foreground invisible">Placeholder</p>
          </StatCard>

          <StatCard title="Clientes Nuevos" icon={Users} loading={loadingStats}>
            <div className="text-2xl font-bold">{newCustomers.toLocaleString('es-ES')}</div>
            <p className="text-xs text-muted-foreground invisible">Placeholder</p>
          </StatCard>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingProducts ? <Loader2 className="h-6 w-6 animate-spin" /> : <>
                <div className="text-2xl font-bold">{products.length}</div>
                <Link href="/admin/products">
                    <p className={cn("text-xs font-bold hover:underline cursor-pointer", lowStockCount > 0 ? "text-red-500" : "text-muted-foreground")}>
                        {lowStockCount} con bajo stock
                    </p>
                </Link>
              </>}
            </CardContent>
          </Card>
      </div>


       {/* Recent Orders and Popular Products */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
             {loadingOrders ? <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div> 
             : recentOrders.length === 0 ? <div className="text-center text-muted-foreground py-4">No hay pedidos recientes.</div>
             : (
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                      </div>
                      <div className="ml-auto font-medium text-primary">{formatPrice(order.total)}</div>
                    </div>
                  ))}
                </div>
             )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Productos Populares</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-center text-muted-foreground py-4">No hay datos de productos.</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
            : topCustomers.length === 0 ? <div className="text-center text-muted-foreground py-4">No hay datos de clientes.</div>
            : (
                <div className="space-y-4">
                  {topCustomers.map(customer => (
                    <div key={customer.userId} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.count} pedidos</p>
                      </div>
                      <div className="ml-auto font-medium text-primary">{formatPrice(customer.total)}</div>
                    </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
