
'use client';

import { Product } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface StockNotificationDialogProps {
  product: Product;
  children: React.ReactNode; // The button that triggers the dialog
}

export function StockNotificationDialog({ product, children }: StockNotificationDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // In a real app, product.id would be used. priceId was from Stripe.
        if (!product?.id || !email) {
            toast({
                title: t('stock_notification.error_title'),
                description: t('stock_notification.error_missing_info'),
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/stock-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Use product.id instead of priceId
                body: JSON.stringify({ email, productId: product.id }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: t('stock_notification.success_title'),
                    description: t('stock_notification.success_description', { email, product_name: product.name }),
                });
                setIsOpen(false);
            } else {
                throw new Error(result.message || t('stock_notification.error_generic'));
            }
        } catch (error: any) {
             toast({
                title: t('stock_notification.error_title'),
                description: error.message || t('stock_notification.error_unexpected'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('stock_notification.dialog_title')}</DialogTitle>
                    <DialogDescription>
                        {t('stock_notification.dialog_description', { product_name: product.name })}
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="col-span-3"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                             <Button type="button" variant="ghost">{t('stock_notification.cancel_button')}</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 animate-spin"/> : <Mail className="mr-2"/>}
                            {loading ? t('stock_notification.sending_button') : t('stock_notification.submit_button')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
