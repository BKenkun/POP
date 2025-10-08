
'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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
import { ArrowUp, Users, Package, ShoppingCart, AlertCircle, ArrowRight, Minus, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatPrice } from "@/lib/utils";
import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { addDays, subDays } from "date-fns";
import { DateRangePicker, DatePresets } from "./_components/date-range-picker";
import { cn } from "@/lib/utils";

const chartData = [
  { date: "2024-09-01", periodA: 186, periodB: 150 },
  { date: "2024-09-02", periodA: 305, periodB: 280 },
  { date: "2024-09-03", periodA: 237, periodB: 200 },
  { date: "2024-09-04", periodA: 273, periodB: 310 },
  { date: "2024-09-05", periodA: 609, periodB: 450 },
  { date: "2024-09-06", periodA: 1190, periodB: 980 },
];

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


const recentOrders = [
  { id: 'ORD-2024-A5B4C3', customer: 'David Pozo Lopez', total: 545.26, status: 'Cancelado' },
  { id: 'ORD-2024-D8E7F6', customer: 'Cliente sin nombre', total: 105.50, status: 'Entregado' },
  { id: 'ORD-2024-G1H2I3', customer: 'Maria Vanesa', total: 150.00, status: 'En Reparto' },
];

const popularProducts = [
  { rank: 1, name: 'Pantalón Chino Estructura Colores Oscuros Slim Fit Hombre', sold: 30, revenue: 405.00 },
  { rank: 2, name: 'Pantalón Chino Colores Oscuros Satén Regular Fit Hombre', sold: 13, revenue: 305.50 },
  { rank: 3, name: 'Aceite CBD 10%', sold: 10, revenue: 399.90 },
];

const topClients = [
    { rank: 1, name: 'Maria Vanesa Cuiña Gomez', orders: 1, total: 150.00 },
    { rank: 2, name: 'Serafin Moya Lozano', orders: 1, total: 48.00 },
    { rank: 3, name: 'Javier G.', orders: 3, total: 280.50 },
];

const StatCard = ({ title, value, change, icon: Icon, format = (v) => v }: { title: string, value: number, change: number, icon: React.ElementType, format?: (v: number) => string | number }) => {
    const isPositive = change > 0;
    const isNegative = change < 0;

    const ChangeIndicator = () => {
        if (change === 0 || isNaN(change)) return <Minus className="h-3 w-3 text-muted-foreground" />;
        return isPositive ? <ArrowUp className="h-3 w-3 text-green-500" /> : <ArrowDown className="h-3 w-3 text-red-500" />;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{format(value)}</div>
                {change !== null && (
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
  const lowStockCount = 5;
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>();
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);
  
  // This is a simulation of data processing
  const processedData = useMemo(() => {
    // Simulate fetching and processing orders based on date ranges
    const periodA = { revenue: 2801, orders: 8, clients: 12 };
    const periodB = { revenue: 2500, orders: 7, clients: 10 };
    
    if (isCompareEnabled) {
      const revenueChange = ((periodA.revenue - periodB.revenue) / periodB.revenue) * 100;
      const ordersChange = ((periodA.orders - periodB.orders) / periodB.orders) * 100;
      const clientsChange = ((periodA.clients - periodB.clients) / periodB.clients) * 100;
      return { ...periodA, revenueChange, ordersChange, clientsChange };
    }
    
    return { ...periodA, revenueChange: 0, ordersChange: 0, clientsChange: 0 };
  }, [dateRange, compareDateRange, isCompareEnabled]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu tienda.</p>
        </div>
         <div className="flex items-center gap-2">
             <DatePresets setDate={setDateRange} />
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
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
               <AreaChart accessibilityLayer data={chartData} margin={{ left: -20, right: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `€${value}`} />
                    <ChartTooltip
                        cursor={true}
                        content={<ChartTooltipContent indicator="dot" />}
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
            </ChartContainer>
          </CardContent>
      </Card>


      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Ingresos" value={processedData.revenue} change={processedData.revenueChange} icon={Package} format={(v) => formatPrice(v * 100)} />
          <StatCard title="Pedidos" value={processedData.orders} change={processedData.ordersChange} icon={ShoppingCart} />
          <StatCard title="Clientes Nuevos" value={processedData.clients} change={processedData.clientsChange} icon={Users} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">239</div>
              <Link href="/admin/stock?filter=low-stock">
                  <p className="text-xs text-red-500 font-bold hover:underline cursor-pointer">
                      {lowStockCount} con bajo stock
                  </p>
              </Link>
            </CardContent>
          </Card>
      </div>


       {/* Alerts Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span>Alertas Importantes</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                     <p className="text-sm text-muted-foreground">No hay alertas nuevas en este momento.</p>
                </div>
            </CardContent>
        </Card>


      {/* Recent Orders and Popular Products */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableBody>
                    {recentOrders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">#{order.id.substring(order.id.length - 12)}</div>
                                <div className="text-xs text-muted-foreground">{order.customer}</div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant={order.status === 'Cancelado' ? 'destructive' : 'secondary'}>{order.status}</Badge>
                                <div className="font-mono text-sm">{formatPrice(order.total * 100)}</div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Productos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableBody>
                    {popularProducts.map(product => (
                        <TableRow key={product.rank}>
                            <TableCell className="w-8 font-bold text-lg text-muted-foreground">{product.rank}</TableCell>
                            <TableCell>
                                <div className="font-medium line-clamp-2">{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.sold} vendidos</div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatPrice(product.revenue * 100)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableBody>
                    {topClients.map(client => (
                        <TableRow key={client.rank}>
                             <TableCell className="w-8 font-bold text-lg text-muted-foreground">{client.rank}</TableCell>
                            <TableCell>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-xs text-muted-foreground">{client.orders} pedidos</div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatPrice(client.total * 100)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

    
