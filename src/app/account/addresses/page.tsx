'use client';

import { useState, useEffect } from "react";
import { useAuth, useTranslation } from "@/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, AlertDialog,
    AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, 
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components"
import { Trash2, Loader2, Home, Briefcase, User, Phone } from "lucide-react"
import { useToast } from "@/hooks";
import { updateUser } from "@/app/actions/user-data";
import { Address } from "@/entities";
import AddressForm from "./address-form";

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
