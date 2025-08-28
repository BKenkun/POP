import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';
import { ShieldCheck, Truck, Box, Send } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

      <div className="bg-yellow-400/20 dark:bg-yellow-800/20 p-8 rounded-lg mt-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-semibold text-2xl mb-3">Suscríbete a nuestro boletín</h3>
            <p className="text-sm text-foreground/80 mb-6">
              Puede cancelar su suscripción en cualquier momento. Para ello, consulte nuestra información de contacto en la declaración legal.
            </p>
            <form className="flex w-full max-w-md mx-auto items-center space-x-2">
              <Input type="email" placeholder="Enter your email..." className="flex-1 bg-white dark:bg-background" />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="h-4 w-4 mr-2" />
                Suscribirse
              </Button>
            </form>
          </div>
        </div>

    </div>
  );
}
