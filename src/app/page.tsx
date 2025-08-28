import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';
import { ShieldCheck, Truck, Box, Send, CreditCard } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Calidad Premium, Sensaciones Únicas</h1>
          <p className="mt-2 text-base text-foreground/80 max-w-2xl mx-auto">
            Explora nuestra cuidada selección de poppers y descubre una pureza y potencia que redefine la experiencia.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Sítio Web 100% Seguro</h3>
                <p className="text-muted-foreground">Tu seguridad es nuestra prioridad.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Pago Discreto</h3>
                <p className="text-muted-foreground">Sin referencias en tu extracto.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Box className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
               <div>
                <h3 className="font-semibold">Embalaje Discreto</h3>
                <p className="text-muted-foreground">Paquetes sin marcas ni logos.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Truck className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
               <div>
                <h3 className="font-semibold">Entrega Rápida</h3>
                <p className="text-muted-foreground">Recibe tu pedido en 24/48h.</p>
              </div>
            </div>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
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
