import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">Popper España</h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          Descubre nuestra exclusiva colección de productos popper premium. Calidad inigualable para una experiencia sin precedentes.
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
