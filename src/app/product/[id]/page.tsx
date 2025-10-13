
'use client';

import { notFound, useParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { ProductInfo } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from './related-products';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ProductPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Skeleton className="h-[500px] w-full" />
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}


export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const productDocRef = useMemoFirebase(() => doc(firestore, 'products', id), [firestore, id]);
  const { data: product, isLoading: loadingProduct } = useDoc<Product>(productDocRef);

  const allProductsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), where('active', '==', true)), [firestore]);
  const { data: allProducts, isLoading: loadingAllProducts } = useCollection<Product>(allProductsQuery);

  if (loadingProduct || loadingAllProducts) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    notFound();
  }

  const galleryImages = [
    product.imageUrl,
    ...(product.galleryImages || []),
  ];
  
  const hasDetails = (product.productDetails && product.productDetails.length > 0) || (product.longDescription && product.longDescription.length > 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={galleryImages} productName={product.name} />
        <ProductInfo product={product} />
      </div>
      
      {hasDetails && (
        <>
          <Separator className="my-10" />
          <ProductDetails product={product} />
        </>
      )}

      <Separator className="my-10" />
      <RelatedProducts currentProduct={product} allProducts={allProducts || []} />
    </div>
  );
}
