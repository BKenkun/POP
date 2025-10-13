'use client';

import { TrendingUp } from 'lucide-react';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { formatPrice } from '@/lib/utils';
import type { ChartConfig } from '@/components/ui/chart';

interface OverviewChartProps {
  data: {
    date: string;
    recogidos: number;
    proyectados: number;
  }[];
}

const chartConfig = {
  proyectados: {
    label: 'Proyectados',
    color: 'hsl(var(--chart-2))',
  },
  recogidos: {
    label: 'Recogidos',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function OverviewChart({ data }: OverviewChartProps) {
  if (!data || data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Visión General de Ingresos</CardTitle>
                 <CardDescription>
                    No hay datos de ingresos para el período seleccionado.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
                 <p className="text-muted-foreground">Selecciona otro rango de fechas o espera a que haya nuevos pedidos.</p>
            </CardContent>
        </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Visión General de Ingresos</CardTitle>
        <CardDescription>
          Ingresos proyectados vs. recogidos en el período seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatPrice(value * 100)} // Assume value is in euros, convert to cents for formatter
            />
             <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    formatter={(value, name) => (
                      <div className="flex flex-col">
                        <span className="font-bold">{formatPrice(Number(value) * 100)}</span>
                      </div>
                    )}
                  />
                }
              />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="recogidos"
              type="monotone"
              stroke="var(--color-recogidos)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="proyectados"
              type="monotone"
              stroke="var(--color-proyectados)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
