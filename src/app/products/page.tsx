
import { getStripeProducts } from '@/lib/stripe';
import { Product } from '@/lib/types';
import ProductFilters from './filters';
import { getUniqueValues } from '@/lib/utils';

export const metadata = {
    title: 'Todos los Productos | Popper España',
    description: 'Explora nuestro catálogo completo de poppers. Filtra por marca, categoría y ordena por precio o popularidad.',
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const products: Product[] = await getStripeProducts();
    
    // Extract unique values for filtering
    const uniqueBrands = getUniqueValues(products, 'brand');
    const uniqueSizes = getUniqueValues(products, 'size');
    const uniqueCompositions = getUniqueValues(products, 'composition');

    return (
        <div>
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Nuestro Catálogo</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    Encuentra tu aroma perfecto. Usa los filtros para descubrir nuestra selección.
                </p>
            </div>
            <ProductFilters 
                products={products} 
                uniqueBrands={uniqueBrands}
                uniqueSizes={uniqueSizes}
                uniqueCompositions={uniqueCompositions}
                searchParams={searchParams}
            />
        </div>
    );
}
