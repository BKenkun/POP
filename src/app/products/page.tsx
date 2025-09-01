
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
    const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : undefined;

    // Extract unique tags for filtering
    const allTags = new Set<string>();
    products.forEach(p => p.tags?.forEach(t => allTags.add(t)));
    const uniqueTags = Array.from(allTags);

    return (
        <div>
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">Nuestro Catálogo</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    Encuentra tu aroma perfecto. Usa los filtros para descubrir nuestra selección.
                </p>
            </div>
            <ProductFilters products={products} uniqueTags={uniqueTags} initialSearchQuery={searchQuery}/>
        </div>
    );
}
