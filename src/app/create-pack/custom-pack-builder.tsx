
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Plus, Minus, Package, ShoppingCart, Trash2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product-card';
import { calculatePackPrice, PackItem } from '@/ai/flows/calculate-pack-price-flow';

interface CustomPackBuilderProps {
  products: Product[];
}

const MAX_PACK_ITEMS = 18;

export default function CustomPackBuilder({ products }: CustomPackBuilderProps) {
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const { addCustomPackToCart } = useCart();
  const { toast } = useToast();
  const [priceDetails, setPriceDetails] = useState<{ originalTotal: number, discountedTotal: number, savings: number } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const totalPackQuantity = packItems.reduce((total, item) => total + item.quantity, 0);

  const updatePrice = useCallback(async (currentPack: PackItem[]) => {
      if (currentPack.length === 0) {
          setPriceDetails(null);
          return;
      }
      setIsCalculating(true);
      try {
          const result = await calculatePackPrice(currentPack);
          setPriceDetails(result);
      } catch (error) {
          console.error("Error calculating pack price:", error);
          toast({ title: "Error", description: "Could not calculate pack price.", variant: "destructive" });
      } finally {
          setIsCalculating(false);
      }
  }, [toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
        updatePrice(packItems);
    }, 500); // Debounce API calls
    return () => clearTimeout(handler);
  }, [packItems, updatePrice]);

  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    
    setPackItems((prev) => {
        let updatedPack: PackItem[];
        const existingItem = prev.find((item) => item.id === product.id);

        if (newQuantity <= 0) {
            updatedPack = prev.filter((item) => item.id !== product.id);
        } else {
            const isAgotado = product.stock === 0;
            if(isAgotado) {
                toast({ title: "Producto Agotado", description: `${product.name} no está disponible actualmente.`, variant: "destructive" });
                return prev;
            }

            if (product.stock && newQuantity > product.stock) {
                toast({ title: 'Stock insuficiente', description: `Solo quedan ${product.stock} unidades de ${product.name}.`, variant: 'destructive' });
                return prev;
            }
            
            const currentQuantityInPack = existingItem?.quantity || 0;
            const quantityDifference = newQuantity - currentQuantityInPack;
            
            if (totalPackQuantity + quantityDifference > MAX_PACK_ITEMS) {
                toast({ title: 'Límite del pack alcanzado', description: `No puedes añadir más de ${MAX_PACK_ITEMS} productos a tu pack.`, variant: 'destructive'});
                return prev;
            }
            
            if (existingItem) {
                updatedPack = prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: newQuantity } : item
                );
            } else {
                const { name, imageUrl, imageHint, ...restOfProduct } = product;
                updatedPack = [...prev, { ...restOfProduct, quantity: newQuantity }];
            }
        }
        return updatedPack;
    });
  };
  
  const handleAddToCart = () => {
    if (packItems.length === 0 || !priceDetails || priceDetails.discountedTotal === 0) {
      toast({
        title: 'Pack vacío',
        description: 'Añade al menos un producto para crear tu pack.',
        variant: 'destructive',
      });
      return;
    }

    addCustomPackToCart(packItems, priceDetails.discountedTotal);

    toast({
      title: '¡Pack añadido al carrito!',
      description: 'Hemos añadido tu pack personalizado al carrito de compra.',
    });

    setPackItems([]);
    setPriceDetails(null);
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
                            {packItems.map(item => {
                                // Find full product info to display name/image
                                const productInfo = products.find(p => p.id === item.id);
                                if (!productInfo) return null;
                                return (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                                            <Image src={productInfo.imageUrl} alt={productInfo.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{productInfo.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity} x {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handleUpdateQuantity(productInfo, 0)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
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
                        
                        {isCalculating && (
                             <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Calculando descuento...</span>
                            </div>
                        )}

                        {priceDetails && !isCalculating && (
                            <>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Precio Original:</span>
                                    <span className="line-through">{formatPrice(priceDetails.originalTotal)}</span>
                                </div>
                                <div className="flex justify-between text-destructive font-bold">
                                    <span>Tu Ahorro:</span>
                                    <span>-{formatPrice(priceDetails.savings)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-primary">
                                    <span>Total del Pack:</span>
                                    <span>{formatPrice(priceDetails.discountedTotal)}</span>
                                </div>
                            </>
                        )}
                        <Button size="lg" onClick={handleAddToCart} disabled={isCalculating || !priceDetails}>
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
