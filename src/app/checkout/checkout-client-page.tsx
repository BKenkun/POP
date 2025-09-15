
"use client";

import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, ShoppingBag, ShieldCheck, CreditCard, Clock, Box, Gift, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSessionAction } from '@/app/actions/checkout';
import { useAuth } from '@/context/auth-context';

export default function CheckoutClientPage() {
  const { cartItems, cartTotal, cartCount, volumeDiscount, totalWithDiscount } = useCart();
  const { user, loyaltyPoints } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applyPoints, setApplyPoints] = useState(false);

  // Constants for calculations
  const shippingCost = totalWithDiscount > 4000 ? 0 : 500;
  const taxRate = 0.08; // 8%

  // Calculate loyalty points discount
  const pointsValue = loyaltyPoints * 2; // 1 point = 2 cents
  const loyaltyDiscount = useMemo(() => {
    if (!applyPoints || !user) return 0;
    // Discount cannot be greater than the subtotal with volume discount
    return Math.min(pointsValue, totalWithDiscount);
  }, [applyPoints, user, pointsValue, totalWithDiscount]);

  // Calculate final totals
  const subtotalAfterLoyalty = totalWithDiscount - loyaltyDiscount;
  const taxAmount = subtotalAfterLoyalty * taxRate;
  const finalTotal = subtotalAfterLoyalty + shippingCost + taxAmount;
  
  useEffect(() => {
    if (cartCount === 0 && !loading) {
       setTimeout(() => router.push('/'), 100);
    }
  }, [cartCount, router, loading]);

  const handlePayment = async () => {
    setLoading(true);
    toast({
        title: 'Redirigiendo al pago...',
        description: 'Por favor, espera mientras preparamos tu compra segura.',
    });

    try {
        const pointsToRedeem = applyPoints ? Math.floor(loyaltyDiscount / 2) : 0;
        
        const { sessionUrl, error: sessionError } = await createCheckoutSessionAction(
            cartItems,
            user?.uid,
            pointsToRedeem
        );

        if (sessionError || !sessionUrl) {
            throw new Error(sessionError || 'Could not create checkout session.');
        }

        window.location.href = sessionUrl;
        
    } catch (error: any) {
        console.error("Payment Error: ", error);
        toast({
            title: 'Error en el Pago',
            description: error.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.',
            variant: 'destructive',
        });
        setLoading(false);
    }
  };

  if (cartCount === 0 && !loading) {
    return (
       <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
            <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground">Redirecting you to our products...</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-headline text-primary mb-8 text-center font-bold">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-headline mb-4 font-bold">Order Summary</h2>
          <Card>
            <CardContent className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="mt-8 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Sítio Web 100% seguro</p>
                <p>Tus datos están protegidos en todo momento.</p>
              </div>
            </div>
             <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Pago anónimo</p>
                <p>No mencionamos el nombre del sitio web en el extracto bancario.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Entrega en 24/48 horas (con Chrono Express)</p>
                <p>Pedidos realizados hasta las 12h en día laboral se entregan en 24/48h (España Península).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Box className="h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Embalaje discreto</p>
                <p>Tu privacidad está garantizada con un paquete sin marcas.</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-headline mb-4 font-bold">Payment Details</h2>
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {volumeDiscount > 0 && (
                 <div className="flex justify-between text-destructive">
                    <span>Descuento por volumen</span>
                    <span>-{formatPrice(volumeDiscount)}</span>
                </div>
              )}
               <Separator />
               <div className="flex justify-between font-semibold">
                <span>Subtotal con descuento</span>
                <span>{formatPrice(totalWithDiscount)}</span>
              </div>
              
              {user && loyaltyPoints > 0 && (
                 <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/30">
                    <div className="space-y-0.5">
                        <Label htmlFor="loyalty-points" className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-primary"/>
                            <span>Aplicar {loyaltyPoints} puntos ({formatPrice(pointsValue)})</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">Usa tus puntos para obtener un descuento.</p>
                    </div>
                    <Switch
                        id="loyalty-points"
                        checked={applyPoints}
                        onCheckedChange={setApplyPoints}
                    />
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-destructive">
                    <span>Descuento por puntos</span>
                    <span>-{formatPrice(loyaltyDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Shipping</span>
                 <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (Est.)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePayment} disabled={loading || cartCount === 0}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Lock className="mr-2 h-4 w-4" /> }
                {loading ? 'Procesando...' : `Pagar ${formatPrice(finalTotal)}`}
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <p>Secure payments powered by Stripe</p>
              </div>
            </CardFooter>
          </Card>
           <div className="text-center mt-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              &larr; Back to shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
