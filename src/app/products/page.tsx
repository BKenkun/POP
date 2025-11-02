
'use client';

import { Product } from '@/lib/types';
import ProductFilters from './filters';
import { getUniqueValues } from '@/lib/utils';
import { Suspense, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useTranslation } from '@/context/language-context';

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

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const productsQuery = query(collection(db, 'products'), where('active', '!=', false));
        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(fetchedProducts);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);


    if (isLoading) {
        return (
             <div>
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">{t('products.title')}</h1>
                    <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                        {t('products.subtitle')}
                    </p>
                </div>
                <ProductPageSkeleton />
            </div>
        );
    }

    // Filtra la marca incorrecta antes de pasarla a los filtros
    const uniqueBrands = getUniqueValues(products, 'brand').filter(brand => brand !== 'Rsuh');
    const uniqueSizes = getUniqueValues(products, 'size');
    const uniqueCompositions = getUniqueValues(products, 'composition');
    
    return (
        <div>
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">{t('products.title')}</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    {t('products.subtitle')}
                </p>
            </div>
            <Suspense fallback={<ProductPageSkeleton />}>
                 <ProductFilters 
                    products={products} 
                    uniqueBrands={uniqueBrands}
                    uniqueSizes={uniqueSizes}
                    uniqueCompositions={uniqueCompositions}
                />
            </Suspense>
        </div>
    );
}

    