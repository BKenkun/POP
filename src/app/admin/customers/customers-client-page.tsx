
'use client';

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
import { Users, MoreHorizontal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Customer } from "./page";


export default function CustomersClientPage({ initialCustomers }: { initialCustomers: Customer[] }) {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Listado de Usuarios Registrados</CardTitle>
            <CardDescription>Aquí puedes ver todos los clientes que se han registrado en tu tienda.</CardDescription>
        </CardHeader>
        <CardContent>
            {initialCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-center border-dashed border-2 rounded-lg">
                    <Users className="h-16 w-16 text-muted-foreground/30" strokeWidth={1} />
                    <h3 className="mt-4 text-lg font-semibold">No hay clientes registrados</h3>
                    <p className="text-muted-foreground">Los nuevos usuarios aparecerán aquí cuando se registren.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registrado</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {initialCustomers.map((customer) => (
                        <TableRow key={customer.uid}>
                        <TableCell className="flex items-center gap-3">
                           <Avatar>
                                <AvatarImage src={customer.photoURL} alt={customer.displayName || customer.email} />
                                <AvatarFallback>{(customer.displayName || customer.email)?.charAt(0).toUpperCase()}</AvatarFallback>
                           </Avatar>
                           <span className="font-medium">{customer.displayName || 'Sin nombre'}</span>
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{new Date(customer.creationTime).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                             <Badge variant={customer.disabled ? 'destructive' : 'default'}>
                                {customer.disabled ? 'Deshabilitado' : 'Activo'}
                             </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menú</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem disabled>Ver Pedidos</DropdownMenuItem>
                                    <DropdownMenuItem disabled>Deshabilitar Usuario</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
