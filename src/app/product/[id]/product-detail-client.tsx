'use client';

import { useState, useEffect } from 'react';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { ProductInfo } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from './related-products';

interface ProductDetailClientProps {
  initialProduct: Product;
  initialAllProducts: Product[];
}

export default function ProductDetailClient({
  initialProduct,
  initialAllProducts,
}: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [allProducts, setAllProducts] = useState<Product[]>(initialAllProducts);
  const [loadingAllProducts, setLoadingAllProducts] = useState(
    initialAllProducts.length === 0
  );

  useEffect(() => {
    if (!initialProduct.id) return;

    const productDocRef = doc(db, 'products', initialProduct.id);
    const unsubscribeProduct = onSnapshot(
      productDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const next = { id: docSnap.id, ...docSnap.data() } as Product;
          if (next.active !== false) {
            setProduct(next);
          }
        }
      },
      () => {
        // Keep SSR initialProduct if client snapshot fails
      }
    );

    const allProductsQuery = query(
      collection(db, 'products'),
      where('active', '!=', false)
    );
    const unsubscribeAll = onSnapshot(
      allProductsQuery,
      (snapshot) => {
        const products = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Product)
        );
        if (products.length > 0) {
          setAllProducts(products);
        }
        setLoadingAllProducts(false);
      },
      () => {
        setLoadingAllProducts(false);
      }
    );

    return () => {
      unsubscribeProduct();
      unsubscribeAll();
    };
  }, [initialProduct.id]);

  const galleryImages = [
    product.imageUrl,
    ...(product.galleryImages || []),
  ];

  const hasDetails =
    (product.productDetails && product.productDetails.length > 0) ||
    (product.longDescription && product.longDescription.length > 0);

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
