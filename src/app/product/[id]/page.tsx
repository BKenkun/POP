import { getStripeProducts } from '@/lib/stripe';
import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { ProductInfo } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from './related-products';

async function getProduct(id: string): Promise<Product | undefined> {
  const products = await getStripeProducts();
  return products.find((p) => p.id === id);
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  if (!product) {
    return {
      title: 'Producto no encontrado',
    };
  }
  return {
    title: `${product.name} | Popper Online`,
    description: product.description || `Detalles sobre ${product.name}`,
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const allProducts = await getStripeProducts();
  const product = allProducts.find((p) => p.id === resolvedParams.id);

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
      <RelatedProducts currentProduct={product} allProducts={allProducts} />
    </div>
  );
}
