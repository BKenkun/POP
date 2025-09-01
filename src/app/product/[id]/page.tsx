import { getStripeProducts } from '@/lib/stripe';
import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { ProductInfo } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';

export const revalidate = 60; // Revalidate every 60 seconds

async function getProduct(id: string): Promise<Product | undefined> {
  const products = await getStripeProducts();
  return products.find((p) => p.id === id);
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) {
    return {
      title: 'Producto no encontrado',
    };
  }
  return {
    title: `${product.name} | Popper España`,
    description: product.description || `Detalles sobre ${product.name}`,
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const galleryImages = [
    product.imageUrl,
    ...(product.galleryImages || []),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={galleryImages} productName={product.name} />
        <ProductInfo product={product} />
      </div>
      
      {(product.description || (product.productDetails && Object.keys(product.productDetails).length > 0)) && (
        <>
          <Separator className="my-10" />
          <ProductDetails product={product} />
        </>
      )}

    </div>
  );
}
