
'use client';

import { useState }from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Plus, Minus, Package, ShoppingCart, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product-card';

interface CustomPackBuilderProps {
  products: Product[];
}

interface PackItem extends Product {
  quantity: number;
}

const MAX_PACK_ITEMS = 18;

export default function CustomPackBuilder({ products }: CustomPackBuilderProps) {
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const totalPackQuantity = packItems.reduce((total, item) => total + item.quantity, 0);
  const packTotal = packItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    
    if (newQuantity <= 0) {
      setPackItems((prev) => prev.filter((item) => item.id !== product.id));
      return;
    }
    
    const isAgotado = product.stock === 0;
    if(isAgotado) {
        toast({
            title: "Producto Agotado",
            description: `${product.name} no está disponible actualmente.`,
            variant: "destructive"
        });
        return;
    }

    if (product.stock && newQuantity > product.stock) {
        toast({
            title: 'Stock insuficiente',
            description: `Solo quedan ${product.stock} unidades de ${product.name}.`,
            variant: 'destructive',
        });
        return;
    }

    const currentQuantityInPack = packItems.find(item => item.id === product.id)?.quantity || 0;
    const quantityDifference = newQuantity - currentQuantityInPack;
    
    if (totalPackQuantity + quantityDifference > MAX_PACK_ITEMS) {
         toast({
            title: 'Límite del pack alcanzado',
            description: `No puedes añadir más de ${MAX_PACK_ITEMS} productos a tu pack.`,
            variant: 'destructive',
        });
        return;
    }

    setPackItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        return [...prev, { ...product, quantity: newQuantity }];
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
      addToCart(item, item.quantity);
    });

    toast({
      title: '¡Pack añadido al carrito!',
      description: 'Hemos añadido los productos seleccionados a tu carrito de compra.',
    });

    setPackItems([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">1. Elige tus productos</h2>
            <div className="text-right">
                <p className="font-bold text-lg">{totalPackQuantity} / {MAX_PACK_ITEMS}</p>
                <p className="text-sm text-muted-foreground">productos en tu pack</p>
            </div>
        </div>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => {
              const packItem = packItems.find((item) => item.id === product.id);
              const quantityInPack = packItem?.quantity || 0;
              const isAgotado = product.stock === 0;

              return (
                <ProductCard 
                    key={product.id} 
                    product={product}
                    className={cn(quantityInPack > 0 && 'border-primary border-2 shadow-lg')}
                >
                    <div className="p-4 pt-0">
                         {isAgotado ? (
                             <Button disabled className="w-full">
                                <X className="mr-2"/> Agotado
                             </Button>
                         ) : quantityInPack > 0 ? (
                            <div className="flex items-center justify-center gap-2">
                                <Button size="icon" variant="outline" onClick={() => handleUpdateQuantity(product, quantityInPack - 1)}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-xl font-bold w-12 text-center">{quantityInPack}</span>
                                <Button size="icon" variant="outline" onClick={() => handleUpdateQuantity(product, quantityInPack + 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full" variant="outline" onClick={() => handleUpdateQuantity(product, 1)}>
                                <Plus className="mr-2"/>Añadir
                            </Button>
                        )}
                    </div>
                </ProductCard>
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
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} x {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handleUpdateQuantity(item, 0)}>
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
                         <div className="flex justify-between font-bold">
                            <span>Unidades Totales:</span>
                            <span>{totalPackQuantity} / {MAX_PACK_ITEMS}</span>
                        </div>
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

