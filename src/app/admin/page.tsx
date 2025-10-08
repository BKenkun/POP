
'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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
import { ArrowUp, Users, Package, ShoppingCart, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatPrice } from "@/lib/utils";

const chartData = [
  { month: "May", revenue: 186 },
  { month: "Jun", revenue: 305 },
  { month: "Jul", revenue: 237 },
  { month: "Aug", revenue: 273 },
  { month: "Sep", revenue: 609 },
  { month: "Oct", revenue: 1190 },
]

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig


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

export default function AdminDashboardPage() {
  const lowStockCount = 5; // Example value
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu tienda.</p>
        </div>
         <Button>
            Ver Reportes
        </Button>
      </div>

      {/* Main Chart */}
      <Card>
          <CardHeader>
              <CardTitle>Tendencia de Ingresos</CardTitle>
              <CardDescription>Evolución de los ingresos en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart accessibilityLayer data={chartData} margin={{ left: -20, right: 20}}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                 <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `€${value}`} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                    dataKey="revenue"
                    type="natural"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
      </Card>

      {/* Stats Cards */}
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUp className="h-3 w-3 text-green-500"/>
                +700.0% este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
             <span className="text-xl font-bold">€</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">198.24€</div>
            <p className="text-xs text-muted-foreground">+12.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">383</div>
            <p className="text-xs text-muted-foreground">+12 nuevos este mes</p>
          </CardContent>
        </Card>
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
                    {/* Example of an alert */}
                    {/* 
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <p className="text-sm">El producto <span className="font-bold">"Flores CBD 'Gelato'"</span> tiene 25 solicitudes de aviso de stock.</p>
                        <Button variant="outline" size="sm">Ver Producto</Button>
                    </div> 
                    */}
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
