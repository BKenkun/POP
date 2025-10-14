
import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import { firestore } from '@/lib/firebase-admin';
import { ProductGallery } from './product-gallery';
import { ProductInfo, ProductInfoClient } from './product-info';
import { ProductDetails } from './product-details';
import { Separator } from '@/components/ui/separator';
import { RelatedProducts } from './related-products';

// Server-side function to fetch a single product
async function getProduct(id: string): Promise<Product | null> {
    try {
        const docRef = firestore.collection('products').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return null;
        }

        return { id: docSnap.id, ...docSnap.data() } as Product;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
}

// Server-side function to fetch all active products
async function getAllProducts(): Promise<Product[]> {
    try {
        const snapshot = await firestore.collection('products').where('active', '!=', false).get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
    }
}

// This is now a Server Component
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // Fetch data directly on the server
    const product = await getProduct(id);
    
    // If no product is found, show the 404 page
    if (!product) {
        notFound();
    }

    // Fetch related products on the server
    const allProducts = await getAllProducts();

    const galleryImages = [
        product.imageUrl,
        ...(product.galleryImages || []),
    ];
    
    const hasDetails = (product.productDetails && product.productDetails.length > 0) || (product.longDescription && product.longDescription.length > 0);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* ProductGallery is a Client Component that receives image data */}
                <ProductGallery images={galleryImages} productName={product.name} />
                
                <div className="flex flex-col space-y-6">
                    {/* ProductInfo is a Server Component for static display */}
                    <ProductInfo product={product} />
                    {/* ProductInfoClient handles user interactions */}
                    <ProductInfoClient product={product} />
                </div>
            </div>
            
            {hasDetails && (
                <>
                    <Separator className="my-10" />
                    <ProductDetails product={product} />
                </>
            )}

            <Separator className="my-10" />
            
            {/* RelatedProducts is a Client Component that receives product data */}
            <RelatedProducts currentProduct={product} allProducts={allProducts} />
        </div>
    );
}
