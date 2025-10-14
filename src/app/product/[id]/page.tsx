
'use client';

import { notFound, useParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { ProductInfoClient } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from './related-products';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ProductPageContent() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const productDocRef = useMemoFirebase(() => doc(firestore, 'products', id), [firestore, id]);
    const { data: product, isLoading: loadingProduct } = useDoc<Product>(productDocRef);

    const allProductsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), where('active', '!=', false)), [firestore]);
    const { data: allProducts, isLoading: loadingAllProducts } = useCollection<Product>(allProductsQuery);

    if (loadingProduct) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-4">
                        <Skeleton className="aspect-square w-full" />
                        <div className="grid grid-cols-4 gap-2">
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="aspect-square w-full" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-10 w-1/3" />
                        <Skeleton className="h-20 w-full" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-32" />
                            <Skeleton className="h-12 flex-1" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!product) {
        notFound();
    }

    const galleryImages = [
        product.imageUrl,
        ...(product.galleryImages || []),
    ];
    
    const hasDetails = (product.productDetails && product.productDetails.length > 0) || (product.longDescription && product.longDescription.length > 0);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <ProductGallery images={galleryImages} productName={product.name} />
                <ProductInfoClient product={product} />
            </div>
            
            {hasDetails && (
                <>
                    <Separator className="my-10" />
                    <ProductDetails product={product} />
                </>
            )}

            <Separator className="my-10" />
            
            {loadingAllProducts ? (
                <Skeleton className="h-64 w-full" />
            ) : (
                <RelatedProducts currentProduct={product} allProducts={allProducts || []} />
            )}
        </div>
    );
}


export default function ProductDetailPage() {
    // This wrapper component is necessary because hooks like useParams
    // can only be used in client components.
    return <ProductPageContent />;
}

