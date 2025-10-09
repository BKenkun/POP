

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
import { cbdProducts } from "@/lib/cbd-products";

// This component is now client-side and will fetch its own data.
// It no longer relies on pre-fetched data from a server action.

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
  const [products] = useState<Product[]>(cbdProducts);
  const [loading, setLoading] = useState(true);

  // Simplified data for the dashboard.
  // In a real scenario, this would fetch data from the server.
  const processedData = useMemo(() => {
    return {
        revenue: 0,
        orderCount: 0,
        clients: { size: 0 },
        revenueChange: 0,
        ordersChange: 0,
        clientsChange: 0,
        chartData: [],
        lowStockCount: products.filter(p => p.stock !== undefined && p.stock <= 5).length,
        topProducts: [],
        topClients: [],
        recentOrders: [],
    };
  }, [products]);
  
  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
    }, 1000);
  }, [dateRange, compareDateRange]);


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
            <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                <p>Los datos de la gráfica se cargarán aquí.</p>
            </div>
            }
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
             <div className="text-center text-muted-foreground py-4">No hay pedidos recientes.</div>
            }
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Productos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> :
             <div className="text-center text-muted-foreground py-4">No hay datos de productos.</div>
            }
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> :
             <div className="text-center text-muted-foreground py-4">No hay datos de clientes.</div>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
