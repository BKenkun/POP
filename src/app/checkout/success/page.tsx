'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Loader2, CheckCircle, ShoppingBag, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const PAYMENT_CONFIRM_TIMEOUT_MS = 3 * 60 * 1000;

function SuccessPageContent() {
  const router = useRouter();
  const { clearCart, cartCount } = useCart();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!orderId) {
      router.replace('/');
    }
  }, [orderId, router]);

  useEffect(() => {
    if (!orderId || !user || authLoading) return;

    const orderRef = doc(db, 'users', user.uid, 'orders', orderId);

    const unsubscribe = onSnapshot(orderRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as { status?: string };
      if (data.status === 'order_received') {
        if (!clearedRef.current) {
          clearedRef.current = true;
          clearCart();
        }
        setIsConfirmed(true);
      }
    });

    return () => unsubscribe();
  }, [orderId, user, authLoading, clearCart]);

  useEffect(() => {
    if (!orderId || !user || authLoading || isConfirmed) return;

    const timer = window.setTimeout(() => {
      setTimedOut(true);
    }, PAYMENT_CONFIRM_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [orderId, user, authLoading, isConfirmed]);

  if (!orderId) {
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto px-4">
        <p className="text-muted-foreground mb-4">Inicia sesión para ver el estado de tu pedido.</p>
        <Button asChild>
          <Link href={`/login?redirect=${encodeURIComponent(`/checkout/success?order_id=${orderId}`)}`}>
            Iniciar sesión
          </Link>
        </Button>
      </div>
    );
  }

  if (timedOut && !isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 max-w-lg mx-auto px-4">
        <Card className="w-full">
          <CardHeader className="items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <AlertCircle className="h-10 w-10 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-headline">Confirmando tu pago</CardTitle>
            <CardDescription className="text-base">
              Aún no hemos podido confirmar el pago en tiempo real. Si ya pagaste, el pedido aparecerá en tu cuenta en
              unos minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/account/orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ver mis pedidos
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contacto">Contacto</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verificando estado del pago...</p>
        <p className="text-sm mt-2 text-muted-foreground/80">Por favor, no cierres esta ventana.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary font-bold">¡Pago Completado!</CardTitle>
          <CardDescription className="text-lg text-foreground/80">
            Gracias por tu compra, {user?.email?.split('@')[0] || 'cliente'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Hemos recibido tu pago correctamente. Recibirás un email con los detalles del pedido en breve.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Button asChild size="lg">
              <Link href={`/account/orders/${encodeURIComponent(orderId)}`}>
                <ShoppingBag className="mr-2" />
                Ver Mi Pedido
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/account">
                <User className="mr-2" />
                Ir a mi Cuenta
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
