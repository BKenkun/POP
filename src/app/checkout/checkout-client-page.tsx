"use client";

import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Lock, ShoppingBag, ShieldCheck, CreditCard, Clock, Box } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSessionAction } from '@/app/actions/checkout';

export default function CheckoutClientPage() {
  const { cartItems, cartTotal, cartCount } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const shippingCost = cartTotal > 4000 ? 0 : 500; // 5.00€, free over 40€
  const taxAmount = cartTotal * 0.08; // 8% tax
  const total = cartTotal + shippingCost + taxAmount;
  
  useEffect(() => {
    // Redirect to home if cart is empty on page load
    if (cartCount === 0 && !loading) {
       setTimeout(() => router.push('/'), 100);
    }
  }, [cartCount, router, loading]);

  const handlePayment = async () => {
    setLoading(true);
    toast({
        title: 'Redirecting to payment...',
        description: 'Please wait while we prepare your secure checkout.',
    });

    try {
        const { sessionUrl, error: sessionError } = await createCheckoutSessionAction(cartItems);

        if (sessionError || !sessionUrl) {
            throw new Error(sessionError || 'Could not create checkout session.');
        }

        // Redirect to Stripe's checkout page
        window.location.href = sessionUrl;
        
    } catch (error: any) {
        console.error("Payment Error: ", error);
        toast({
            title: 'Payment Failed',
            description: error.message || 'Something went wrong. Please try again later.',
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
      <h1 className="text-3xl md:text-4xl font-headline text-primary mb-8 text-center">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-headline mb-4">Order Summary</h2>
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
          <h2 className="text-2xl font-headline mb-4">Payment Details</h2>
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
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
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePayment} disabled={loading || cartCount === 0}>
                <Lock className="mr-2 h-4 w-4" />
                {loading ? 'Processing...' : 'Proceed to Payment'}
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
