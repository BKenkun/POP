
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
import { Users, MoreHorizontal, Loader2, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { updateUserRoles } from '@/app/actions/user-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Define a type for the user data we expect from the server action
export interface Customer {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    disabled: boolean;
    creationTime: string | Date; // Can be ISO string or Date object
    roles?: ('editor' | 'repartidor' | 'contable')[];
}

const ROLES_CONFIG: { [key: string]: { label: string; color: string } } = {
  editor: { label: 'Editor', color: 'bg-blue-500 hover:bg-blue-500' },
  repartidor: { label: 'Repartidor', color: 'bg-green-500 hover:bg-green-500' },
  contable: { label: 'Contable', color: 'bg-purple-500 hover:bg-purple-500' },
};

const ManageRolesDialog = ({ customer, onRolesUpdate }: { customer: Customer, onRolesUpdate: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState(customer.roles || []);
    const { toast } = useToast();

    const handleRoleToggle = (role: 'editor' | 'repartidor' | 'contable') => {
        setSelectedRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateUserRoles(customer.uid, selectedRoles);
        if (result.success) {
            toast({ title: 'Roles actualizados', description: `Los roles para ${customer.displayName || customer.email} han sido guardados.` });
            onRolesUpdate(); // Notify parent to refetch/re-render
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsSaving(false);
        setIsOpen(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                 <div onClick={() => setIsOpen(true)} className="flex items-center w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Gestionar Roles
                </div>
            </DropdownMenuItem>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gestionar Roles para {customer.displayName}</DialogTitle>
                    <DialogDescription>Selecciona los roles que este usuario tendrá en el sistema.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {Object.keys(ROLES_CONFIG).map((role) => (
                        <div key={role} className="flex items-center space-x-3 rounded-md border p-4">
                            <Checkbox
                                id={`role-${role}`}
                                checked={selectedRoles.includes(role as any)}
                                onCheckedChange={() => handleRoleToggle(role as any)}
                            />
                             <Label htmlFor={`role-${role}`} className="flex flex-col gap-1 w-full cursor-pointer">
                                <span className="font-semibold">{ROLES_CONFIG[role].label}</span>
                             </Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// --- Componente Contenedor (Servidor) ---
// Responsabilidad: Obtener y sanear los datos de los clientes.
export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCustomers = () => {
        const usersQuery = collection(db, 'users');
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const fetchedCustomers: Customer[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    uid: doc.id,
                    email: data.email,
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                    disabled: data.disabled || false,
                    creationTime: data.creationTime instanceof Timestamp ? data.creationTime.toDate() : new Date(data.creationTime),
                    roles: data.roles || [],
                };
            });
            setCustomers(fetchedCustomers);
            setIsLoading(false);
        });

        return unsubscribe;
    }

    useEffect(() => {
        const unsubscribe = fetchCustomers();
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
            <CardDescription>Aquí puedes ver y gestionar todos los clientes y sus roles en la tienda.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex items-center justify-center h-60">
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
                        <TableHead>Roles</TableHead>
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
                            <div className="flex flex-wrap gap-1">
                                {customer.roles?.map(role => (
                                    <Badge key={role} className={ROLES_CONFIG[role]?.color || 'bg-secondary'}>
                                        {ROLES_CONFIG[role]?.label || role}
                                    </Badge>
                                )) || <span className="text-xs text-muted-foreground">Sin roles</span>}
                            </div>
                        </TableCell>
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
                                    <DropdownMenuSeparator />
                                    <ManageRolesDialog customer={customer} onRolesUpdate={fetchCustomers} />
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
