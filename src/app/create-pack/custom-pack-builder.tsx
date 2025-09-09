
'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { PlusCircle, MinusCircle, Package, ShoppingCart, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CustomPackBuilderProps {
  products: Product[];
}

export default function CustomPackBuilder({ products }: CustomPackBuilderProps) {
  const [packItems, setPackItems] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleToggleItem = (product: Product) => {
    setPackItems((prevItems) => {
      const isAgotado = product.stock === 0;
      if(isAgotado) {
        toast({
            title: "Producto Agotado",
            description: `${product.name} no está disponible actualmente.`,
            variant: "destructive"
        });
        return prevItems;
      }
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        return prevItems.filter((item) => item.id !== product.id);
      } else {
        return [...prevItems, product];
      }
    });
  };

  const handleAddToCart = () => {
    if (packItems.length === 0) {
      toast({
        title: 'Pack vacío',
        description: 'Añade al menos un producto para crear tu pack.',
        variant: 'destructive',
      });
      return;
    }

    packItems.forEach((item) => {
      addToCart(item);
    });

    toast({
      title: '¡Pack añadido al carrito!',
      description: 'Hemos añadido los productos seleccionados a tu carrito de compra.',
    });

    setPackItems([]);
  };

  const packTotal = packItems.reduce((total, item) => total + item.price, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4">1. Elige tus productos</h2>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => {
              const isSelected = packItems.some((item) => item.id === product.id);
              const isAgotado = product.stock === 0;
              return (
                <Card
                  key={product.id}
                  onClick={() => handleToggleItem(product)}
                  className={cn(
                    'cursor-pointer transition-all border-2',
                    isSelected ? 'border-primary shadow-lg' : 'border-border/60 hover:shadow-md',
                    isAgotado && 'opacity-50 cursor-not-allowed bg-muted/30'
                  )}
                >
                  <div className="relative">
                    <div className="relative h-48 w-full">
                       <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        data-ai-hint={product.imageHint}
                      />
                    </div>
                     <div
                      className={cn(
                        'absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/50 bg-background'
                      )}
                    >
                      {isSelected ? (
                        <MinusCircle className="h-4 w-4" />
                      ) : (
                        <PlusCircle className="h-4 w-4" />
                      )}
                    </div>
                     {isAgotado && (
                        <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                            <span className="font-bold text-destructive">AGOTADO</span>
                        </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base font-medium leading-tight">{product.name}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="lg:col-span-1">
         <h2 className="text-2xl font-bold mb-4">2. Revisa tu pack</h2>
        <Card className="sticky top-24">
            <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    <span>Resumen del Pack</span>
                 </CardTitle>
            </CardHeader>
            <CardContent>
                 {packItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        Selecciona productos de la izquierda para empezar a crear tu pack.
                    </p>
                 ) : (
                    <ScrollArea className="h-64 pr-4">
                        <div className="space-y-4">
                            {packItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                     <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handleToggleItem(item)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                 )}
            </CardContent>
             {packItems.length > 0 && (
                <>
                    <Separator />
                    <CardFooter className="flex-col items-stretch gap-4 pt-6">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total del Pack:</span>
                            <span>{formatPrice(packTotal)}</span>
                        </div>
                        <Button size="lg" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-2" />
                            Añadir Pack al Carrito
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
      </div>
    </div>
  );
}

