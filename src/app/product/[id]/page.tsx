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
  const allProducts = await getStripeProducts();
  const product = allProducts.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const galleryImages = [
    product.imageUrl,
    ...(product.galleryImages || []),
  ];
  
  // Clean up the description content before rendering
  let descriptionContent = product.longDescription || product.description || '';
  if (typeof descriptionContent === 'string') {
      const openDivs = (descriptionContent.match(/<div/g) || []).length;
      const closeDivs = (descriptionContent.match(/<\/div>/g) || []).length;
      if (closeDivs > openDivs) {
        // Basic cleanup for mismatched closing div tags
        descriptionContent = descriptionContent.replace(/<\/div>\s*$/, '');
      }
  }
  
  const hasDetails = product.productDetails && product.productDetails.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={galleryImages} productName={product.name} />
        <ProductInfo product={product} />
      </div>
      
      <Separator className="my-10" />

      <div
          className="prose dark:prose-invert max-w-none text-foreground/80"
          dangerouslySetInnerHTML={{ __html: descriptionContent }}
        />

      <Separator className="my-10" />
      
      <ProductDetails product={product} />

      <Separator className="my-10" />
      <RelatedProducts currentProduct={product} allProducts={allProducts} />
    </div>
  );
}
