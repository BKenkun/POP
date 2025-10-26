
'use client';

import { Product } from '@/lib/types';
import CustomPackBuilder from './custom-pack-builder';
import { getUniqueValues } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


export default function CreatePackPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const productsQuery = query(collection(db, 'products'), where('active', '==', true));
        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
            const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(fetchedProducts);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching products for pack builder:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const { availableForPack, uniqueBrands, uniqueSizes, uniqueCompositions } = useMemo(() => {
        const validProducts = products || [];
        const available = validProducts.filter(p => 
            !p.internalTags?.includes('accesorio') && 
            !p.internalTags?.includes('pack')
        );
        return {
            availableForPack: available,
            uniqueBrands: getUniqueValues(available, 'brand'),
            uniqueSizes: getUniqueValues(available, 'size'),
            uniqueCompositions: getUniqueValues(available, 'composition'),
        };
    }, [products]);


    return (
        <div>
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Crea tu Pack Personalizado</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    Elige tus aromas favoritos de nuestro catálogo y construye el pack perfecto para ti.
                </p>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Cargando productos...</p>
                </div>
            ) : (
                <CustomPackBuilder 
                    products={availableForPack}
                    uniqueBrands={uniqueBrands}
                    uniqueSizes={uniqueSizes}
                    uniqueCompositions={uniqueCompositions}
                />
            )}
        </div>
    );
}
