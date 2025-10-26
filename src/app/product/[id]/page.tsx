
'use client';

import { useParams, notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { ProductInfo } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from './related-products';
import { db } from '@/lib/firebase';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

// This is now a Client Component that fetches its own data.
export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingAllProducts, setLoadingAllProducts] = useState(true);

  useEffect(() => {
    if (!id) return;
    const productDocRef = doc(db, 'products', id);
    const unsubscribeProduct = onSnapshot(productDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
            setProduct(null);
        }
        setLoadingProduct(false);
    });

    const allProductsQuery = query(collection(db, 'products'), where('active', '!=', false));
    const unsubscribeAll = onSnapshot(allProductsQuery, (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setAllProducts(products);
        setLoadingAllProducts(false);
    });

    return () => {
        unsubscribeProduct();
        unsubscribeAll();
    };
  }, [id]);


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
      
      <RelatedProducts 
        currentProduct={product} 
        allProducts={allProducts} 
        loading={loadingAllProducts} 
      />
    </div>
  );
}
