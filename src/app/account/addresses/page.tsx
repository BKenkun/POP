'use client';

import { useState, useEffect } from "react";
import { useAuth, useTranslation } from "@/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Switch,
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, AlertDialog,
    AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, 
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, } from "@/components"
import { PlusCircle, Edit, Trash2, Loader2, Home, Briefcase, User, Phone } from "lucide-react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks";
import { updateUser } from "@/app/actions/user-data";
import { Address } from "@/entities";
import { AddressFormData } from "@/schemas";

//FIXME - Address form should be in another file
const AddressForm = ({ address, onSave }: { address?: Address, onSave: (data: Partial<Address>, action: 'add-address' | 'update-address') => void }) => { //FIXME - Address actions
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const form = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema), //FIXME - default values is constructor
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
        const action = address ? 'update-address' : 'add-address'; //FIXME - ActionEnum
        const payload = address ? { ...data, id: address.id } : data;
        onSave(payload, action);
        setIsOpen(false);
        form.reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {address ? (
                    <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />{t('account.addresses_edit_button')}</Button>
                ) : (
                    <Button><PlusCircle className="mr-2"/>{t('account.addresses_add_button')}</Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{address ? t('account.addresses_dialog_edit_title') : t('account.addresses_dialog_add_title')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="alias" render={({ field }) => (
                            <FormItem><FormLabel>{t('account.addresses_dialog_alias_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>{t('account.addresses_dialog_name_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>{t('account.addresses_dialog_phone_label')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="street" render={({ field }) => (
                            <FormItem><FormLabel>{t('account.addresses_dialog_street_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>{t('account.addresses_dialog_city_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="state" render={({ field }) => (
                            <FormItem><FormLabel>{t('account.addresses_dialog_state_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem><FormLabel>{t('account.addresses_dialog_zip_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>{t('account.addresses_dialog_country_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="isDefault" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <FormLabel className="mb-0">{t('account.addresses_dialog_default_label')}</FormLabel>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">{t('account.addresses_dialog_cancel_button')}</Button></DialogClose>
                            <Button type="submit">{t('account.addresses_dialog_save_button')}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default function AddressesPage() {
    const { user, userDoc, setUserDoc } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (userDoc !== undefined) {
            setLoading(false);
        }
    }, [userDoc]);

    const addresses: Address[] = userDoc?.addresses || [];

    const handleSaveAddress = async (data: Partial<Address>, action: 'add-address' | 'update-address') => {
        if (!user) return;
        
        const result = await updateUser(action, data);
        if (result.success && result.user) {
            toast({ title: t('account.addresses_toast_save_success_title'), description: t('account.addresses_toast_save_success_desc') });
            setUserDoc(result.user);
        } else {
            toast({ title: t('account.addresses_toast_save_error_title'), description: result.message || t('account.addresses_toast_save_error_desc'), variant: "destructive" });
        }
    };
    
    const handleDeleteAddress = async (addressId: string) => {
        if (!user) return;

        const result = await updateUser('delete-address', { id: addressId });
        if (result.success && result.user) {
            toast({ title: t('account.addresses_toast_delete_success_title'), description: t('account.addresses_toast_delete_success_desc'), variant: "destructive" });
            setUserDoc(result.user);
        } else {
             toast({ title: t('account.addresses_toast_save_error_title'), description: result.message || t('account.addresses_toast_delete_error_desc'), variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">{t('account.addresses_title')}</h2>
            <p className="text-muted-foreground">
                {t('account.addresses_subtitle')}
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
                            {address.isDefault && <span className="text-xs font-normal bg-primary text-primary-foreground px-2 py-1 rounded-full">{t('account.addresses_default_badge')}</span>}
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
                                     <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>{t('account.addresses_delete_button')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('account.addresses_delete_confirm_title')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('account.addresses_delete_confirm_desc')}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('account.addresses_dialog_cancel_button')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteAddress(address.id)}>
                                            {t('account.addresses_delete_confirm_continue')}
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
           <p className="text-muted-foreground text-center py-8">{t('account.addresses_empty_placeholder')}</p>
       )}
    </div>
  )
}
