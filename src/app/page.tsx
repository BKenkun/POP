import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';
import { ShieldCheck, Truck, Box, Send, CreditCard } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">Calidad Premium, Sensaciones Únicas</h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          Explora nuestra cuidada selección de poppers y descubre una pureza y potencia que redefine la experiencia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left max-w-5xl mx-auto">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-base">Sítio Web 100% Seguro</h3>
                <p className="text-sm text-muted-foreground">Tu seguridad es nuestra prioridad.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-base">Pago Discreto</h3>
                <p className="text-sm text-muted-foreground">Sin referencias en tu extracto.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Box className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
               <div>
                <h3 className="font-semibold text-base">Embalaje Discreto</h3>
                <p className="text-sm text-muted-foreground">Paquetes sin marcas ni logos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
               <div>
                <h3 className="font-semibold text-base">Entrega Rápida</h3>
                <p className="text-sm text-muted-foreground">Recibe tu pedido en 24/48h.</p>
              </div>
            </div>
        </div>

        <div className="bg-muted/40 p-8 rounded-lg">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="font-semibold font-headline text-2xl mb-3">Suscríbete a nuestro boletín</h3>
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

    </div>
  );
}
