import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-headline text-primary tracking-tight">PuroRush</h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          Discover our exclusive collection of premium Rush products. Unmatched quality for an unparalleled experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
