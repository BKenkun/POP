
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Package, ShoppingCart, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./_components/date-range-picker";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { cbdProducts } from "@/lib/cbd-products";
import type { Order, OrderItem, Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, collectionGroup, query, where, orderBy, limit, Timestamp, onSnapshot } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDays, startOfMonth, format as formatDate, subDays } from "date-fns";
import { OverviewChart } from "./_components/overview-chart";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";

// Define a type for the user data we expect
export interface Customer {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    creationTime?: string | Timestamp; // Can be string or Timestamp
}

const getImageUrl = (url: string) => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

const StatCard = ({ 
    title, 
    icon: Icon, 
    loading, 
    value, 
    description,
    compareValue,
}: { 
    title: string;
    icon: React.ElementType;
    loading: boolean; 
    value: string | number;
    description: string;
    compareValue?: string | number | null;
}) => {
    const hasComparison = compareValue !== null && compareValue !== undefined;
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9,-]+/g, "").replace(',', '.')) : value;
    const numericCompareValue = typeof compareValue === 'string' ? parseFloat(compareValue.replace(/[^0-9,-]+/g, "").replace(',', '.')) : (compareValue ?? 0);
    const difference = hasComparison ? numericValue - numericCompareValue : 0;
    const isPositive = difference >= 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                        {hasComparison && (
                            <div className={cn("flex items-center text-xs font-semibold", isPositive ? "text-green-600" : "text-red-600")}>
                                {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                {difference.toLocaleString('es-ES', { maximumFractionDigits: 2 })} vs. periodo anterior
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: today,
  });
  
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>({
      from: subDays(startOfMonth(today), 30),
      to: subDays(today, 30)
  });
  const [isCompareEnabled, setIsCompareEnabled] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [allUsers, setAllUsers] = useState<Customer[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    // Only fetch data if the user is a logged-in admin
    if (!user || !isAdmin) {
      setLoadingOrders(false);
      setLoadingUsers(false);
      setLoadingProducts(false);
      return;
    }
    
    const ordersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setAllOrders(orders);
      setLoadingOrders(false);
    }, (error) => {
        console.error("Error fetching orders:", error);
        setLoadingOrders(false);
    });

    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Customer));
      setAllUsers(users);
      setLoadingUsers(false);
    }, (error) => {
        console.error("Error fetching users:", error);
        setLoadingUsers(false);
    });
    
    const productsQuery = query(collection(db, 'products'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(products);
      setLoadingProducts(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        setLoadingProducts(false);
    });


    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeProducts();
    };
  }, [user, isAdmin]);

  const processDateRange = (range: DateRange | undefined, orders: Order[], users: Customer[]) => {
      if (!orders || !users) return { filteredOrders: [], filteredUsers: [], totalRevenue: 0, collectedRevenue: 0 };
      
      const from = range?.from;
      const to = range?.to;

      const filteredOrders = orders.filter(order => {
          if (!from) return true;
          const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
          const toDate = to ? addDays(to, 1) : new Date(); // include the whole "to" day
          return orderDate >= from && orderDate < toDate;
      });

      const filteredUsers = users.filter(user => {
          if (!from || !user.creationTime) return false;
          const userDate = user.creationTime instanceof Timestamp ? user.creationTime.toDate() : new Date(user.creationTime);
          const toDate = to ? addDays(to, 1) : new Date();
          return userDate >= from && userDate < toDate;
      });

      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const collectedRevenue = filteredOrders
        .filter(order => order.status === 'Entregado')
        .reduce((sum, order) => sum + order.total, 0);

      return { filteredOrders, filteredUsers, totalRevenue, collectedRevenue };
  };

  const { 
      currentPeriod,
      previousPeriod,
      recentOrders, 
      topCustomers,
      chartData,
      popularProducts,
  } = useMemo(() => {
      if (!allOrders || !allUsers) return { currentPeriod: null, previousPeriod: null, recentOrders: [], topCustomers: [], chartData: [], popularProducts: [] };

      const currentPeriod = processDateRange(dateRange, allOrders, allUsers);
      const previousPeriod = isCompareEnabled ? processDateRange(compareDateRange, allOrders, allUsers) : null;
      
      const recentOrders = allOrders.slice(0, 5);
      
      const customerSpending = allOrders.reduce((acc, order) => {
          if (!order.userId || order.userId === 'guest') return acc;
          if (!acc[order.userId]) {
              acc[order.userId] = { userId: order.userId, name: order.customerName, email: order.customerEmail, total: 0, count: 0 };
          }
          acc[order.userId].total += order.total;
          acc[order.userId].count += 1;
          acc[order.userId].name = order.customerName; // Use latest name
          return acc;
      }, {} as Record<string, { userId: string, name: string, email: string, total: number, count: number }>);
      
      const topCustomers = Object.values(customerSpending).sort((a, b) => b.total - a.total).slice(0, 5);
      
        const dailyData = currentPeriod.filteredOrders.reduce((acc, order) => {
            const date = formatDate(order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt), 'yyyy-MM-dd');
            if (!acc[date]) {
                acc[date] = { date, proyectados: 0, recogidos: 0 };
            }
            acc[date].proyectados += order.total / 100;
            if (order.status === 'Entregado') {
                acc[date].recogidos += order.total / 100;
            }
            return acc;
        }, {} as Record<string, { date: string; proyectados: number; recogidos: number }>);
        
        const chartData = Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
        const productSales = currentPeriod.filteredOrders.flatMap(o => o.items).reduce((acc, item: OrderItem) => {
            if (!acc[item.productId]) {
                const productInfo = products.find(p => p.id === item.productId);
                acc[item.productId] = { 
                    productId: item.productId, 
                    name: productInfo?.name || item.name, 
                    imageUrl: productInfo?.imageUrl || item.imageUrl,
                    unitsSold: 0 
                };
            }
            acc[item.productId].unitsSold += item.quantity;
            return acc;
        }, {} as Record<string, { productId: string; name: string; imageUrl: string; unitsSold: number; }>);

        const popularProducts = Object.values(productSales).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);

      return { currentPeriod, previousPeriod, recentOrders, topCustomers, chartData, popularProducts };
  }, [allOrders, allUsers, dateRange, compareDateRange, isCompareEnabled, products]);


  const totalOrders = currentPeriod?.filteredOrders.length ?? 0;
  const newCustomers = currentPeriod?.filteredUsers.length ?? 0;
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

        <OverviewChart data={chartData} />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                title="Ingresos Recogidos" 
                icon={DollarSign} 
                loading={loadingStats}
                value={formatPrice(currentPeriod?.collectedRevenue ?? 0)}
                description={`${formatPrice(currentPeriod?.totalRevenue ?? 0)} proyectados`}
                compareValue={previousPeriod ? formatPrice(previousPeriod.collectedRevenue) : null}
            />

            <StatCard 
                title="Pedidos" 
                icon={ShoppingCart} 
                loading={loadingStats}
                value={totalOrders.toLocaleString('es-ES')}
                description="Total de pedidos en el período."
                compareValue={previousPeriod?.filteredOrders.length}
            />

            <StatCard 
                title="Clientes Nuevos" 
                icon={Users} 
                loading={loadingStats}
                value={newCustomers.toLocaleString('es-ES')}
                description="Usuarios registrados en el período."
                compareValue={previousPeriod?.filteredUsers.length}
            />

             <StatCard 
                title="Productos Activos" 
                icon={Package} 
                loading={loadingProducts}
                value={products.length}
                description={`${lowStockCount} con bajo stock`}
            />
        </div>


       {/* Recent Orders and Popular Products */}
      <div className="grid gap-4 lg:grid-cols-3">
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
                {loadingOrders ? <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                : popularProducts.length === 0 ? <div className="text-center text-muted-foreground py-4">No hay datos de ventas.</div>
                : (
                    <div className="space-y-4">
                    {popularProducts.map(product => (
                        <div key={product.productId} className="flex items-center">
                        <Avatar className="h-9 w-9 relative">
                             <Image src={getImageUrl(product.imageUrl)} alt={product.name} fill className="object-cover" />
                            <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{product.name}</p>
                             <p className="text-sm text-muted-foreground">
                                {product.unitsSold} {product.unitsSold === 1 ? 'unidad vendida' : 'unidades vendidas'}
                            </p>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
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
