
import { getStripeProducts } from '@/lib/stripe';
import { Product } from '@/lib/types';
import CustomPackBuilder from './custom-pack-builder';

export const metadata = {
    title: 'Crea tu Pack Personalizado | Popper España',
    description: 'Selecciona tus productos favoritos y crea tu propio pack de poppers. Descuentos por cantidad y combinaciones únicas.',
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CreatePackPage() {
    const products: Product[] = await getStripeProducts();
    
    // Filter out products that are accessories or packs themselves
    const availableForPack = products.filter(p => 
        !p.internalTags?.includes('accesorio') && 
        !p.internalTags?.includes('pack')
    );

    return (
        <div>
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Crea tu Pack Personalizado</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    Elige tus aromas favoritos de nuestro catálogo y construye el pack perfecto para ti.
                </p>
            </div>
            <CustomPackBuilder products={availableForPack} />
        </div>
    );
}
