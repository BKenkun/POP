
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
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface StockNotificationDialogProps {
  product: Product;
  children: React.ReactNode; // The button that triggers the dialog
}

export function StockNotificationDialog({ product, children }: StockNotificationDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!product?.id || !email) {
            toast({
                title: 'Error',
                description: 'Product information or email is missing. Please try again.',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/stock-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, productId: product.id }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "We'll notify you!",
                    description: `You will receive an email at ${email} as soon as ${product.name} is back in stock.`,
                });
                setIsOpen(false);
            } else {
                throw new Error(result.message || 'Could not process your request.');
            }
        } catch (error: any) {
             toast({
                title: 'Error',
                description: error.message || 'An unexpected error occurred.',
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
                    <DialogTitle>Stock Notification</DialogTitle>
                    <DialogDescription>
                        You will receive a single email when {product.name} is back in stock.
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
                                placeholder="you@email.com"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                             <Button type="button" variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 animate-spin"/> : <Mail className="mr-2"/>}
                            {loading ? 'Sending...' : 'Request Notification'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
