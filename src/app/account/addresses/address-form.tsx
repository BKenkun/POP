import { Button, Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Switch } from "@/components";
import { useTranslation } from "@/context";
import { Address } from "@/entities";
import { AddressFormData, addressSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const AddressForm = ({ address, onSave }: { address?: Address, onSave: (data: Partial<Address>, action: 'add-address' | 'update-address') => void }) => { //FIXME - Address actions
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
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
        const action = address ? 'update-address' : 'add-address';
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

export default AddressForm