'use client';

import { useState, useEffect } from 'react';
import { doc, collection, query, where, getDoc, getDocs } from 'firebase/firestore';
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
    let active = true;

    const refreshProductData = async () => {
      try {
        const productDocRef = doc(db, 'products', initialProduct.id);
        const allProductsQuery = query(
          collection(db, 'products'),
          where('active', '!=', false)
        );
        const [productSnap, allSnap] = await Promise.allSettled([
          getDoc(productDocRef),
          getDocs(allProductsQuery),
        ]);

        if (!active) return;

        if (productSnap.status === 'fulfilled' && productSnap.value.exists()) {
          const next = { id: productSnap.value.id, ...productSnap.value.data() } as Product;
          if (next.active !== false) {
            setProduct(next);
          }
        }

        if (allSnap.status === 'fulfilled') {
          const products = allSnap.value.docs.map(
            (d) => ({ id: d.id, ...d.data() } as Product)
          );
          if (products.length > 0) {
            setAllProducts(products);
          }
        }
      } finally {
        if (active) setLoadingAllProducts(false);
      }
    };

    void refreshProductData();

    return () => {
      active = false;
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
