
'use client';

import { useCart } from '@/context/cart-context';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ShieldCheck, Truck, Box, Bell, Mail, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
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
import { subscribeToStockNotification } from '@/app/actions/stock-notification';

interface ProductInfoProps {
  product: Product;
}

function StockNotificationDialog({ product }: { product: Product }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await subscribeToStockNotification({ productId: product.id, email });

        if (result.success) {
            toast({
                title: '¡Te avisaremos!',
                description: `Recibirás un correo en ${email} en cuanto ${product.name} vuelva a estar disponible.`,
            });
            setIsOpen(false);
        } else {
            toast({
                title: 'Error',
                description: result.error || 'No se pudo procesar tu solicitud.',
                variant: 'destructive',
            });
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="lg" variant="outline">
                    <Bell className="mr-2 h-5 w-5" />
                    Avísame cuando vuelva
                </Button>
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


export function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart();
  const isSoldOut = product.stock === 0;

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
            {isSoldOut && (
                <Badge variant="destructive">Agotado</Badge>
            )}
            {!isSoldOut && product.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-headline text-primary font-bold">
          {product.name}
        </h1>
        <p className="text-3xl font-bold mt-2">{formatPrice(product.price)}</p>
        {product.description && (
            <p className="text-foreground/80 mt-4">{product.description}</p>
        )}
      </div>
      
        {isSoldOut ? (
            <StockNotificationDialog product={product} />
        ) : (
             <Button
                size="lg"
                onClick={() => addToCart(product)}
                disabled={isSoldOut}
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Añadir al carrito
            </Button>
        )}


      <Separator />

      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary" />
          <p>Compra segura y pago discreto garantizado.</p>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 flex-shrink-0 text-primary" />
          <p>Envío rápido en 24/48h a toda la península.</p>
        </div>
        <div className="flex items-center gap-3">
          <Box className="h-5 w-5 flex-shrink-0 text-primary" />
          <p>Embalaje 100% discreto sin marcas externas.</p>
        </div>
      </div>
    </div>
  );
}
