
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

interface StockNotificationDialogProps {
  product: Product;
  children: React.ReactNode; // The button that triggers the dialog
}

export function StockNotificationDialog({ product, children }: StockNotificationDialogProps) {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!product?.priceId || !email) {
            toast({
                title: 'Error',
                description: 'Falta información del producto o el email. Inténtalo de nuevo.',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/stock-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, priceId: product.priceId }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: '¡Te avisaremos!',
                    description: `Recibirás un correo en ${email} en cuanto ${product.name} vuelva a estar disponible.`,
                });
                setIsOpen(false);
            } else {
                throw new Error(result.message || 'No se pudo procesar tu solicitud.');
            }
        } catch (error: any) {
             toast({
                title: 'Error',
                description: error.message || 'Ocurrió un error inesperado.',
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
                    <DialogTitle>Notificación de Stock</DialogTitle>
                    <DialogDescription>
                        Recibirás un único correo cuando {product.name} vuelva a estar disponible.
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
                             <Button type="button" variant="ghost">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 animate-spin"/> : <Mail className="mr-2"/>}
                            {loading ? 'Enviando...' : 'Solicitar Notificación'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
