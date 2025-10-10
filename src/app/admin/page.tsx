
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./_components/date-range-picker";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { cbdProducts } from "@/lib/cbd-products";
import type { Product } from "@/lib/types";

const StatCard = ({ title, value, icon: Icon, loading, format = (v: number) => v }: { title: string, value: number, icon: React.ElementType, loading: boolean, format?: (v: number) => string | number }) => {
    if (loading) return <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader><CardContent><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{format(value)}</div>
                 <p className="text-xs text-muted-foreground">
                    Datos de ejemplo
                </p>
            </CardContent>
        </Card>
    );
};

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>();
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setProducts(cbdProducts);
    setLoading(false);
  }, []);

  const lowStockCount = products.filter(p => p.stock !== undefined && p.stock <= 5).length;

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
            <Button disabled>Ver Reportes</Button>
        </div>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Tendencia de Ingresos</CardTitle>
              <CardDescription>
                  Los datos de la gráfica se cargarán aquí.
              </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground bg-secondary/30 rounded-md">
                <p>Gráfica de ingresos no disponible.</p>
            </div>
          </CardContent>
      </Card>


      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Ingresos" value={0} icon={Package} format={(v) => formatPrice(v)} loading={loading} />
          <StatCard title="Pedidos" value={0} icon={ShoppingCart} loading={loading} />
          <StatCard title="Clientes Nuevos" value={0} icon={Users} loading={loading} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>
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
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-center text-muted-foreground py-4">No hay pedidos recientes.</div>
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
             <div className="text-center text-muted-foreground py-4">No hay datos de clientes.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
