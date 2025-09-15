
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

// Placeholder data for orders
const orders = [
  {
    id: "ES1005",
    date: "15 de Julio, 2024",
    status: "Entregado",
    total: "45.50€",
  },
  {
    id: "ES1004",
    date: "28 de Junio, 2024",
    status: "Entregado",
    total: "32.00€",
  },
  {
    id: "ES1003",
    date: "10 de Mayo, 2024",
    status: "Entregado",
    total: "78.90€",
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">Mis Pedidos</h2>
            <p className="text-muted-foreground">
                Aquí puedes ver el historial de todas tus compras.
            </p>
        </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido Nº</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>
                <Badge variant={order.status === 'Entregado' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{order.total}</TableCell>
              <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
