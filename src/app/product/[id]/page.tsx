
import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { ProductGallery } from './product-gallery';
import { ProductInfo, ProductInfoClient } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from './related-products';
import { firestore } from '@/lib/firebase-admin';

// Helper to fetch a single product from Firestore on the server
async function getProduct(id: string): Promise<Product | null> {
    try {
        const productRef = firestore.collection('products').doc(id);
        const doc = await productRef.get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() } as Product;
    } catch (error) {
        console.error("Error fetching product on server:", error);
        return null;
    }
}

// Helper to fetch all active products for related items
async function getAllProducts(): Promise<Product[]> {
    try {
        const productsSnapshot = await firestore.collection('products').where('active', '!=', false).get();
        return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching all products on server:", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);
    if (!product) {
        return { title: 'Producto no encontrado' };
    }
    return {
        title: product.name,
        description: product.description,
    };
}


export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch data on the server
  const product = await getProduct(id);
  const allProducts = await getAllProducts();

  // If product doesn't exist, show 404
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
        {/* Render a client component for the interactive parts */}
        <ProductInfoClient product={product} />
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
