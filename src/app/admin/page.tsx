
'use client';

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { ArrowUp, Users, Package, ShoppingCart, ArrowRight, Minus, ArrowDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatPrice, cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { subDays, startOfDay, endOfDay, isWithinInterval, format as formatDate, differenceInDays } from "date-fns";
import { es } from 'date-fns/locale';
import { DateRangePicker } from "./_components/date-range-picker";
import { Order, Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collectionGroup, query, onSnapshot, orderBy } from "firebase/firestore";
import { cbdProducts } from "@/lib/cbd-products";

const chartConfig = {
  periodA: {
    label: "Periodo A",
    color: "hsl(var(--primary))",
  },
  periodB: {
      label: "Periodo B",
      color: "hsl(var(--secondary))",
  }
} satisfies ChartConfig;

// Helper function to process orders for a given date range
const processOrdersForPeriod = (orders: Order[], range: DateRange | undefined, allProducts: Product[]) => {
    if (!range?.from) return { revenue: 0, orderCount: 0, clients: new Set(), dailyRevenue: new Map<string, number>(), topProducts: new Map(), topClients: new Map() };

    const startDate = startOfDay(range.from);
    const endDate = endOfDay(range.to || range.from);

    const filteredOrders = orders.filter(order => {
        const orderDate = order.createdAt;
        return isWithinInterval(orderDate, { start: startDate, end: endDate });
    });

    const dailyRevenue = new Map<string, number>();
    const topProducts = new Map<string, { name: string, sold: number, revenue: number, imageUrl: string }>();
    const topClients = new Map<string, { name: string, orders: number, total: number }>();
    const clients = new Set<string>();

    let totalRevenue = 0;
    
    // Initialize daily revenue map for the entire range
    let dayCursor = startDate;
    while (dayCursor <= endDate) {
        dailyRevenue.set(formatDate(dayCursor, 'yyyy-MM-dd'), 0);
        dayCursor = subDays(dayCursor, -1);
    }

    filteredOrders.forEach(order => {
        totalRevenue += order.total;
        const dateStr = formatDate(order.createdAt, 'yyyy-MM-dd');
        dailyRevenue.set(dateStr, (dailyRevenue.get(dateStr) || 0) + order.total);
        
        clients.add(order.customerEmail);

        // Update top clients
        const client = topClients.get(order.customerEmail) || { name: order.customerName, orders: 0, total: 0 };
        client.orders += 1;
        client.total += order.total;
        topClients.set(order.customerEmail, client);

        // Update top products
        order.items.forEach(item => {
            const product = topProducts.get(item.productId) || { name: item.name, sold: 0, revenue: 0, imageUrl: item.imageUrl };
            product.sold += item.quantity;
            product.revenue += item.price * item.quantity;
            topProducts.set(item.productId, product);
        });
    });

    return { revenue: totalRevenue, orderCount: filteredOrders.length, clients, dailyRevenue, topProducts, topClients };
};


const StatCard = ({ title, value, change, icon: Icon, format = (v: number) => v, loading }: { title: string, value: number, change: number, icon: React.ElementType, format?: (v: number) => string | number, loading: boolean }) => {
    const isPositive = change > 0;
    const isNegative = change < 0;

    const ChangeIndicator = () => {
        if (change === 0 || isNaN(change)) return <Minus className="h-3 w-3 text-muted-foreground" />;
        return isPositive ? <ArrowUp className="h-3 w-3 text-green-500" /> : <ArrowDown className="h-3 w-3 text-red-500" />;
    };
    
    if (loading) return <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{format(value)}</div>
                {change !== null && isFinite(change) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ChangeIndicator />
                        <span className={cn(isPositive && 'text-green-500', isNegative && 'text-red-500')}>
                            {change.toFixed(2)}%
                        </span>
                        vs. periodo anterior
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>();
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products] = useState<Product[]>(cbdProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const ordersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedOrders.push({
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Order);
      });
      setAllOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching all orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  
  const processedData = useMemo(() => {
    const periodAData = processOrdersForPeriod(allOrders, dateRange, products);
    let periodBData = { revenue: 0, orderCount: 0, clients: new Set(), dailyRevenue: new Map(), topProducts: new Map(), topClients: new Map()};
    let chartData = [];

    if (isCompareEnabled && compareDateRange) {
        periodBData = processOrdersForPeriod(allOrders, compareDateRange, products);
    }
    
    // Combine chart data
    const allDates = new Set([...periodAData.dailyRevenue.keys(), ...periodBData.dailyRevenue.keys()]);
    chartData = Array.from(allDates).sort().map(date => ({
        date,
        periodA: periodAData.dailyRevenue.get(date) || 0,
        periodB: periodBData.dailyRevenue.get(date) || 0,
    }));
    
    const revenueChange = periodBData.revenue > 0 ? ((periodAData.revenue - periodBData.revenue) / periodBData.revenue) * 100 : (periodAData.revenue > 0 ? Infinity : 0);
    const ordersChange = periodBData.orderCount > 0 ? ((periodAData.orderCount - periodBData.orderCount) / periodBData.orderCount) * 100 : (periodAData.orderCount > 0 ? Infinity : 0);
    const clientsChange = periodBData.clients.size > 0 ? ((periodAData.clients.size - periodBData.clients.size) / periodBData.clients.size) * 100 : (periodAData.clients.size > 0 ? Infinity : 0);
    
    const lowStockCount = products.filter(p => p.stock !== undefined && p.stock <= 5).length;
    
    const sortedTopProducts = Array.from(periodAData.topProducts.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    const sortedTopClients = Array.from(periodAData.topClients.values()).sort((a, b) => b.total - a.total).slice(0, 3);
    const recentOrders = allOrders.slice(0,3);

    return { 
      ...periodAData,
      revenueChange, 
      ordersChange, 
      clientsChange,
      chartData,
      lowStockCount,
      topProducts: sortedTopProducts,
      topClients: sortedTopClients,
      recentOrders,
    };
  }, [allOrders, products, dateRange, compareDateRange, isCompareEnabled]);

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
            <Button>
                Ver Reportes
            </Button>
        </div>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Tendencia de Ingresos</CardTitle>
              <CardDescription>
                  {isCompareEnabled ? 'Comparación de ingresos entre los dos periodos seleccionados.' : 'Evolución de los ingresos en el periodo seleccionado.'}
              </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="h-[250px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> :
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
               <AreaChart accessibilityLayer data={processedData.chartData} margin={{ left: -20, right: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => formatDate(new Date(value), 'd MMM', { locale: es })} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `€${value / 100}`} />
                    <ChartTooltip
                        cursor={true}
                        content={<ChartTooltipContent indicator="dot" formatter={(value) => formatPrice(value as number)} />}
                    />
                    <defs>
                        <linearGradient id="fillPeriodA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-periodA)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-periodA)" stopOpacity={0.1} />
                        </linearGradient>
                         {isCompareEnabled && (
                            <linearGradient id="fillPeriodB" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-periodB)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-periodB)" stopOpacity={0.1} />
                            </linearGradient>
                         )}
                    </defs>
                    <Area type="monotone" dataKey="periodA" stroke="var(--color-periodA)" strokeWidth={2} fillOpacity={1} fill="url(#fillPeriodA)" />
                    {isCompareEnabled && <Area type="monotone" dataKey="periodB" stroke="var(--color-periodB)" strokeWidth={2} fillOpacity={1} fill="url(#fillPeriodB)" />}
                    {isCompareEnabled && <Legend verticalAlign="top" height={36} />}
                </AreaChart>
            </ChartContainer>}
          </CardContent>
      </Card>


      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Ingresos" value={processedData.revenue} change={processedData.revenueChange} icon={Package} format={(v) => formatPrice(v)} loading={loading} />
          <StatCard title="Pedidos" value={processedData.orderCount} change={processedData.ordersChange} icon={ShoppingCart} loading={loading} />
          <StatCard title="Clientes Nuevos" value={processedData.clients.size} change={processedData.clientsChange} icon={Users} loading={loading} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>
                <div className="text-2xl font-bold">{products.length}</div>
                <Link href="/admin/products">
                    <p className={cn("text-xs font-bold hover:underline cursor-pointer", processedData.lowStockCount > 0 ? "text-red-500" : "text-muted-foreground")}>
                        {processedData.lowStockCount} con bajo stock
                    </p>
                </Link>
              </>}
            </CardContent>
          </Card>
      </div>


       {/* Recent Orders and Popular Products */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> :
             <Table>
                <TableBody>
                    {processedData.recentOrders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">#{order.id.substring(order.id.length - 7).toUpperCase()}</div>
                                <div className="text-xs text-muted-foreground">{order.customerName}</div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant={order.status === 'cancelled' || order.status === 'Cancelado' ? 'destructive' : 'secondary'}>{order.status}</Badge>
                                <div className="font-mono text-sm">{formatPrice(order.total)}</div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Productos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> :
            <Table>
                <TableBody>
                    {processedData.topProducts.map(product => (
                        <TableRow key={product.name}>
                            <TableCell className="w-8 font-bold text-lg text-muted-foreground">{processedData.topProducts.indexOf(product) + 1}</TableCell>
                            <TableCell>
                                <div className="font-medium line-clamp-2">{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.sold} vendidos</div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatPrice(product.revenue)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> :
             <Table>
                <TableBody>
                    {processedData.topClients.map(client => (
                        <TableRow key={client.name}>
                             <TableCell className="w-8 font-bold text-lg text-muted-foreground">{processedData.topClients.indexOf(client) + 1}</TableCell>
                            <TableCell>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-xs text-muted-foreground">{client.orders} pedidos</div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatPrice(client.total)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

    