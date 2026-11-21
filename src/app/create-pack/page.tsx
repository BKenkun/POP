
'use client';

import { Product } from '@/lib/types';
import CustomPackBuilder from './custom-pack-builder';
import { getUniqueValues } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from '@/context/language-context';


export default function CreatePackPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        let active = true;
        const loadProducts = async () => {
            try {
                const productsQuery = query(collection(db, 'products'), where('active', '==', true));
                const snapshot = await getDocs(productsQuery);
                if (!active) return;
                const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Error fetching products for pack builder:", error);
            } finally {
                if (active) setIsLoading(false);
            }
        };
        void loadProducts();
        return () => {
            active = false;
        };
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
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">{t('pack_builder.page_title')}</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    {t('pack_builder.page_subtitle')}
                </p>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">{t('common.loading') || 'Loading products...'}</p>
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
