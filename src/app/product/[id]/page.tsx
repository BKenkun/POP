'use client';

import { useParams, notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { ProductInfo } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from './related-products';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

// This is now a Client Component that fetches its own data.
export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  // Fetch the specific product using its ID
  const productDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'products', id);
  }, [firestore, id]);
  
  const { data: product, isLoading: loadingProduct } = useDoc<Product>(productDocRef);

  // Fetch all active products for the "related" section
  const allProductsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), where('active', '!=', false));
  }, [firestore]);
  
  const { data: allProducts, isLoading: loadingAllProducts } = useCollection<Product>(allProductsQuery);

  // Show a loading spinner while data is being fetched.
  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is finished and still no product, it's a 404.
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
        <div className="flex flex-col space-y-6">
          {/* ProductInfo now handles both display and user actions */}
          <ProductInfo product={product} />
        </div>
      </div>
      
      {hasDetails && (
        <>
          <Separator className="my-10" />
          <ProductDetails product={product} />
        </>
      )}

      <Separator className="my-10" />
      
      {/* RelatedProducts receives the already fetched list */}
      <RelatedProducts 
        currentProduct={product} 
        allProducts={allProducts || []} 
        loading={loadingAllProducts} 
      />
    </div>
  );
}
