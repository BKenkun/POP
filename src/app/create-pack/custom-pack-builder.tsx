
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, PackItemBrief } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Plus, Minus, Package, Trash2, X, Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { calculatePackPrice, PackCalculationInput, PackCalculationOutput } from '@/ai/flows/calculate-pack-price-flow';
import { useRouter } from 'next/navigation';
import ProductFilters from '@/app/products/filters';
import { useTranslation } from '@/context/language-context';

interface PackItem {
    id: string;
    price: number;
    quantity: number;
    size?: string;
}

interface CustomPackBuilderProps {
  products: Product[];
  uniqueBrands: string[];
  uniqueSizes: string[];
  uniqueCompositions: string[];
}

const MAX_PACK_ITEMS = 18;
const MAX_UNITS_PER_PRODUCT = 6;

const getImageUrl = (url: string) => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

export default function CustomPackBuilder({ products, uniqueBrands, uniqueSizes, uniqueCompositions }: CustomPackBuilderProps) {
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();
  const [priceDetails, setPriceDetails] = useState<PackCalculationOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  const totalPackQuantity = packItems.reduce((total, item) => total + item.quantity, 0);

  const updatePrice = useCallback(async (currentPack: PackCalculationInput) => {
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
        const packInput: PackCalculationInput = packItems.map(item => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            size: item.size
        }));
        updatePrice(packInput);
    }, 500); // Debounce API calls
    return () => clearTimeout(handler);
  }, [packItems, updatePrice]);
  
  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    const existingItem = packItems.find((item) => item.id === product.id);
    const currentQuantityInPack = existingItem?.quantity || 0;
    
    // --- Validations first ---
    if (newQuantity > 0) {
        if (newQuantity > MAX_UNITS_PER_PRODUCT) {
            toast({ title: t('pack_builder.product_limit_title'), description: t('pack_builder.product_limit_desc', { max: MAX_UNITS_PER_PRODUCT }), variant: 'destructive'});
            return;
        }

        const isAgotado = product.stock === 0;
        if(isAgotado) {
            toast({ title: t('pack_builder.sold_out_title'), description: t('pack_builder.sold_out_desc', { name: product.name }), variant: "destructive" });
            return;
        }

        if (product.stock && newQuantity > product.stock) {
            toast({ title: t('pack_builder.stock_insufficient_title'), description: t('pack_builder.stock_insufficient_desc', { stock: product.stock, name: product.name }), variant: 'destructive' });
            return;
        }

        const quantityDifference = newQuantity - currentQuantityInPack;
        if (totalPackQuantity + quantityDifference > MAX_PACK_ITEMS) {
            toast({ title: t('pack_builder.pack_limit_title'), description: t('pack_builder.pack_limit_desc', { max: MAX_PACK_ITEMS }), variant: 'destructive'});
            return;
        }
    }

    // --- State update ---
    setPackItems((prev) => {
        if (newQuantity <= 0) {
            return prev.filter((item) => item.id !== product.id);
        }
        
        const existingItemInPrev = prev.find(item => item.id === product.id);
        if (existingItemInPrev) {
            return prev.map((item) =>
                item.id === product.id ? { ...item, quantity: newQuantity } : item
            );
        } else {
            const { name, imageUrl, imageHint, description, longDescription, tags, internalTags, productDetails, stock, ...restOfProduct } = product;
            return [...prev, { ...restOfProduct, quantity: newQuantity }];
        }
    });
  };
  
  const handleCheckout = async () => {
    if (packItems.length === 0 || !priceDetails || priceDetails.discountedTotal === 0) {
      toast({
        title: t('pack_builder.empty_pack_title'),
        description: t('pack_builder.empty_pack_desc'),
        variant: 'destructive',
      });
      return;
    }

    setIsRedirecting(true);
    toast({
        title: t('pack_builder.redirect_title'),
        description: t('pack_builder.redirect_desc'),
    });

    try {
        // This part is removed as `createCustomPackCheckoutAction` is deprecated
        // Instead, we will simulate adding a custom pack to the cart and redirecting to the main checkout
        console.log("Checkout process for custom pack is deprecated.");
        toast({ title: "Función no disponible", description: "La compra directa de packs personalizados está desactivada.", variant: "destructive"});
        setIsRedirecting(false);
        // Here you would add the custom pack to the cart and redirect
        // For example:
        // const customPackProduct = { ... };
        // addToCart(customPackProduct);
        // router.push('/checkout');

    } catch (error: any) {
        console.error("Checkout Error:", error);
        toast({
            title: t('pack_builder.checkout_error_title'),
            description: error.message || t('pack_builder.checkout_error_desc'),
            variant: 'destructive',
        });
        setIsRedirecting(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
          <ProductFilters
            products={products}
            uniqueBrands={uniqueBrands}
            uniqueSizes={uniqueSizes}
            uniqueCompositions={uniqueCompositions}
            onFilterChange={setFilteredProducts}
            showSort={false}
            showCategories={false}
            showSearch={true}
          />
      </aside>

      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{t('pack_builder.step1_title')}</h2>
            <div className="text-right">
                <p className="font-bold text-lg">{totalPackQuantity} / {MAX_PACK_ITEMS}</p>
                <p className="text-sm text-muted-foreground">{t('pack_builder.products_in_pack')}</p>
            </div>
        </div>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredProducts.map((product) => {
              const packItem = packItems.find((item) => item.id === product.id);
              const quantityInPack = packItem?.quantity || 0;
              const isAgotado = product.stock === 0;

              return (
                <ProductCard 
                    key={product.id} 
                    product={product}
                    className={cn(quantityInPack > 0 && 'border-primary border-2 shadow-lg')}
                    onImageClick={() => handleUpdateQuantity(product, 1)}
                >
                    <div className="p-4 pt-0">
                         {isAgotado ? (
                             <Button disabled className="w-full">
                                <X className="mr-2"/> {t('product_card.sold_out')}
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
                                <Plus className="mr-2"/>{t('pack_builder.add_button')}
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
         <h2 className="text-2xl font-bold mb-4">{t('pack_builder.step2_title')}</h2>
        <Card className="sticky top-24">
            <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    <span>{t('pack_builder.summary_title')}</span>
                 </CardTitle>
            </CardHeader>
            <CardContent>
                 {packItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        {t('pack_builder.empty_pack_message')}
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
                                            <Image src={getImageUrl(productInfo.imageUrl)} alt={productInfo.name} fill className="object-cover" />
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
                            <span>{t('pack_builder.total_units')}:</span>
                            <span>{totalPackQuantity} / {MAX_PACK_ITEMS}</span>
                        </div>
                        
                        {(isCalculating || isRedirecting) && (
                             <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{isRedirecting ? t('pack_builder.processing_payment') : t('pack_builder.calculating_discount')}</span>
                            </div>
                        )}

                        {priceDetails && !isCalculating && !isRedirecting && (
                            <>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{t('pack_builder.original_price')}:</span>
                                    <span className={priceDetails.savings > 0 ? 'line-through' : ''}>
                                        {formatPrice(priceDetails.originalTotal)}
                                    </span>
                                </div>
                                {priceDetails.savings > 0 && (
                                  <>
                                    <div className="flex justify-between text-destructive font-bold">
                                        <span>{t('pack_builder.your_savings')}:</span>
                                        <span>-{formatPrice(priceDetails.savings)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-primary">
                                        <span>{t('pack_builder.pack_total')}:</span>
                                        <span>{formatPrice(priceDetails.discountedTotal)}</span>
                                    </div>
                                  </>  
                                )}
                                {priceDetails.savings <= 0 && priceDetails.originalTotal > 0 && (
                                     <div className="text-xs text-center text-muted-foreground pt-2">
                                        {t('pack_builder.unlock_discount_message')}
                                    </div>
                                )}
                            </>
                        )}
                        <Button size="lg" onClick={handleCheckout} disabled={isCalculating || !priceDetails || isRedirecting}>
                            <CreditCard className="mr-2" />
                            {isRedirecting ? t('pack_builder.redirecting_button') : t('pack_builder.buy_now_button')}
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
      </div>
    </div>
  );
}
