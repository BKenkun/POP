
import { Product } from '@/lib/types';
import ProductFilters from './filters';
import { getUniqueValues } from '@/lib/utils';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cbdProducts } from '@/lib/cbd-products';

export const metadata = {
    title: 'Todos los Productos | Popper Online',
    description: 'Explora nuestro catálogo completo de poppers. Filtra por marca, categoría y ordena por precio o popularidad.',
};

export const revalidate = 60; // Revalidate every 60 seconds

function ProductPageContent({ products, searchParams }: { products: Product[], searchParams: { [key: string]: string | string[] | undefined } }) {
    const uniqueBrands = getUniqueValues(products, 'brand');
    const uniqueSizes = getUniqueValues(products, 'size');
    const uniqueCompositions = getUniqueValues(products, 'composition');
    
    return (
        <ProductFilters 
            products={products} 
            uniqueBrands={uniqueBrands}
            uniqueSizes={uniqueSizes}
            uniqueCompositions={uniqueCompositions}
            searchParams={searchParams}
        />
    )
}

function ProductPageSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
                <Skeleton className="h-[600px] w-full" />
            </aside>
            <main className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-[450px] w-full" />
                ))}
            </main>
        </div>
    )
}


export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const products: Product[] = cbdProducts;
    
    return (
        <div>
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Nuestro Catálogo</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    Encuentra tu aroma perfecto. Usa los filtros para descubrir nuestra selección.
                </p>
            </div>
            <Suspense fallback={<ProductPageSkeleton />}>
                 <ProductPageContent products={products} searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
