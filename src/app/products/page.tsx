
import { getStripeProducts } from '@/lib/stripe';
import { Product } from '@/lib/types';
import ProductFilters from './filters';

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
    const getUniqueValues = (key: keyof Product) => {
        const allValues = new Set<string>();
        products.forEach(p => {
            const value = p[key];
            if (typeof value === 'string' && value) {
                allValues.add(value);
            } else if (Array.isArray(value)) {
                value.forEach(v => allValues.add(v));
            }
        });
        return Array.from(allValues).sort();
    };

    const uniqueBrands = getUniqueValues('brand');
    const uniqueSizes = getUniqueValues('size');
    const uniqueCompositions = getUniqueValues('composition');

    return (
        <div>
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">Nuestro Catálogo</h1>
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
