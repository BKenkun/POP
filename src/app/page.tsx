import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';
import { ShieldCheck, Truck, Box } from 'lucide-react';

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

      <div className="border-t border-border/40 pt-12 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <h3 className="font-semibold text-lg">Sítio Web 100% Seguro</h3>
            <p className="text-muted-foreground text-sm">Tu seguridad es nuestra prioridad. Compra con total confianza.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Box className="h-10 w-10 text-primary" />
            <h3 className="font-semibold text-lg">Embalaje Discreto</h3>
            <p className="text-muted-foreground text-sm">Todos los pedidos se envían en paquetes sin marcas ni logos.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Truck className="h-10 w-10 text-primary" />
            <h3 className="font-semibold text-lg">Entrega Rápida</h3>
            <p className="text-muted-foreground text-sm">Recibe tu pedido en 24/48h en la península (pedidos hasta las 12h).</p>
          </div>
        </div>
      </div>
    </div>
  );
}