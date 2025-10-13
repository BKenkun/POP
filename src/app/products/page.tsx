
'use client';

import { Product } from '@/lib/types';
import ProductFilters from './filters';
import { getUniqueValues } from '@/lib/utils';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

function ProductPageContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const firestore = useFirestore();
    const productsQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'products'), where('active', '==', true));
    }, [firestore]);

    const { data: products, isLoading } = useCollection<Product>(productsQuery);

    if (isLoading) {
        return <ProductPageSkeleton />;
    }

    const validProducts = products || [];

    const uniqueBrands = getUniqueValues(validProducts, 'brand');
    const uniqueSizes = getUniqueValues(validProducts, 'size');
    const uniqueCompositions = getUniqueValues(validProducts, 'composition');
    
    return (
        <ProductFilters 
            products={validProducts} 
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


export default function ProductsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    
    return (
        <div>
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Nuestro Catálogo</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    Encuentra tu aroma perfecto. Usa los filtros para descubrir nuestra selección.
                </p>
            </div>
            <Suspense fallback={<ProductPageSkeleton />}>
                 <ProductPageContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
