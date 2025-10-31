
'use client';

import { useState, useEffect } from 'react';
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
import { Users, MoreHorizontal, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Customer } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';


export default function AdminCustomersClientPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const q = query(collection(db, 'users'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedCustomers: Customer[] = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              fetchedCustomers.push({
                  uid: doc.id,
                  email: data.email,
                  displayName: data.displayName,
                  photoURL: data.photoURL,
                  disabled: data.disabled || false,
                  creationTime: data.creationTime?.toDate().toISOString() || new Date().toISOString(),
              });
          });
          setCustomers(fetchedCustomers);
          setLoading(false);
      }, (error) => {
          console.error("Error fetching customers:", error);
          setLoading(false);
      });
      return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Listado de Usuarios Registrados</CardTitle>
            <CardDescription>Aquí puedes ver y gestionar todos los clientes de la tienda.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : !customers || customers.length === 0 ? (
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
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.uid}>
                        <TableCell className="flex items-center gap-3">
                           <Avatar>
                                <AvatarImage src={customer.photoURL} alt={customer.displayName || customer.email} />
                                <AvatarFallback>{(customer.displayName || customer.email)?.charAt(0).toUpperCase()}</AvatarFallback>
                           </Avatar>
                           <span className="font-medium">{customer.displayName || 'Sin nombre'}</span>
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
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
