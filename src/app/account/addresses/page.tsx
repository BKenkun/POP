
'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Loader2, Home, Briefcase, User, Phone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { manageUserAddress, getCurrentUser } from "@/app/actions/user-data";

interface Address {
    id: string;
    alias: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

const addressSchema = z.object({
  alias: z.string().min(2, "El alias debe tener al menos 2 caracteres (ej. Casa, Trabajo)."),
  name: z.string().min(3, "El nombre del destinatario es requerido."),
  phone: z.string().min(9, "El teléfono es requerido."),
  street: z.string().min(5, "La calle debe tener al menos 5 caracteres."),
  city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres."),
  state: z.string().min(2, "El estado/provincia es requerido."),
  postalCode: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos."),
  country: z.string().min(2, "El país debe tener al menos 2 caracteres."),
  isDefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

const AddressForm = ({ address, onSave }: { address?: Address, onSave: (data: Partial<Address>, action: 'add' | 'update') => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: address || {
            alias: "",
            name: "",
            phone: "",
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "España",
            isDefault: false,
        },
    });

    const onSubmit = (data: AddressFormData) => {
        const action = address ? 'update' : 'add';
        const payload = address ? { ...data, id: address.id } : data;
        onSave(payload, action);
        setIsOpen(false);
        form.reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {address ? (
                    <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Editar</Button>
                ) : (
                    <Button><PlusCircle className="mr-2"/>Añadir Dirección</Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{address ? 'Editar Dirección' : 'Añadir Nueva Dirección'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="alias" render={({ field }) => (
                            <FormItem><FormLabel>Alias de la dirección (ej. Casa, Trabajo)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre completo (Destinatario)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="street" render={({ field }) => (
                            <FormItem><FormLabel>Calle y número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="state" render={({ field }) => (
                            <FormItem><FormLabel>Estado / Provincia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="isDefault" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <FormLabel className="mb-0">Establecer como dirección por defecto</FormLabel>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default function AddressesPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState<Address[]>([]);
    
    useEffect(() => {
        if (!user) return;
        
        const fetchAddresses = async () => {
            setLoading(true);
            const userData = await getCurrentUser();
            if (userData && userData.addresses) {
                setAddresses(userData.addresses);
            }
            setLoading(false);
        };
        fetchAddresses();
    }, [user]);

    const handleSaveAddress = async (data: Partial<Address>, action: 'add' | 'update') => {
        if (!user) return;
        
        const result = await manageUserAddress(action, data);
        if (result.success) {
            toast({ title: "Dirección guardada", description: "Tu lista de direcciones ha sido actualizada." });
            const updatedUser = await getCurrentUser();
            if (updatedUser && updatedUser.addresses) {
                setAddresses(updatedUser.addresses);
            }
        } else {
            toast({ title: "Error", description: result.message || "No se pudo guardar la dirección.", variant: "destructive" });
        }
    };
    
    const handleDeleteAddress = async (addressId: string) => {
        if (!user) return;

        const result = await manageUserAddress('delete', { id: addressId });
        if (result.success) {
            toast({ title: "Dirección eliminada", description: "La dirección ha sido eliminada.", variant: "destructive" });
            const updatedUser = await getCurrentUser();
            if (updatedUser && updatedUser.addresses) {
                setAddresses(updatedUser.addresses);
            }
        } else {
             toast({ title: "Error", description: result.message || "No se pudo eliminar la dirección.", variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">Mis Direcciones</h2>
            <p className="text-muted-foreground">
                Gestiona tus direcciones de envío y facturación.
            </p>
        </div>
        <AddressForm onSave={handleSaveAddress} />
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            {addresses.map((address) => (
                <Card key={address.id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                {address.alias?.toLowerCase() === 'casa' ? <Home className="h-5 w-5"/> : (address.alias?.toLowerCase() === 'trabajo' ? <Briefcase className="h-5 w-5"/> : null) }
                                {address.alias}
                            </span>
                            {address.isDefault && <span className="text-xs font-normal bg-primary text-primary-foreground px-2 py-1 rounded-full">Por defecto</span>}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-2"><User className="h-4 w-4"/> {address.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{address.street}</p>
                        <p className="text-sm text-muted-foreground">{address.city}, {address.state}, {address.postalCode}</p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2"><Phone className="h-4 w-4" /> {address.phone}</p>
                        <div className="flex gap-2 mt-4">
                            <AddressForm address={address} onSave={handleSaveAddress} />
                            
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará permanentemente esta dirección.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteAddress(address.id)}>
                                            Continuar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </div>
                    </CardContent>
                </Card>
            ))}
       </div>
       {addresses.length === 0 && (
           <p className="text-muted-foreground text-center py-8">No tienes ninguna dirección guardada todavía.</p>
       )}
    </div>
  )
}
