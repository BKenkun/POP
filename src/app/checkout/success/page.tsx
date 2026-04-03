'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { Loader2, CheckCircle, ShoppingBag, User, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const PAYMENT_CONFIRM_TIMEOUT_MS = 3 * 60 * 1000;

function SuccessPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!orderId) {
      router.replace('/');
    }
  }, [orderId, router]);

  useEffect(() => {
    if (!orderId || !user || authLoading) return;

    const orderRef = doc(db, 'users', user.uid, 'orders', orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (snap) => {
        setFirestoreError(null);
        if (!snap.exists()) return;
        const data = snap.data() as { status?: string };
        if (data.status === 'order_received') {
          if (!clearedRef.current) {
            clearedRef.current = true;
            clearCart();
          }
          setIsConfirmed(true);
        }
      },
      (err) => {
        console.error('[checkout/success] Firestore listener:', err);
        setFirestoreError(err.message || 'unknown');
      }
    );

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
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-6 max-w-lg mx-auto px-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t('checkout_success.verifying_alert_title')}</AlertTitle>
          <AlertDescription>{t('checkout_success.verifying_alert_desc')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto px-4 gap-4">
        <Alert className="text-left w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('checkout_success.login_alert_title')}</AlertTitle>
          <AlertDescription>{t('checkout_success.login_alert_desc')}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={`/login?redirect=${encodeURIComponent(`/checkout/success?order_id=${orderId}`)}`}>
            {t('checkout.login_button')}
          </Link>
        </Button>
      </div>
    );
  }

  if (firestoreError && !isConfirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('checkout_success.firestore_error_title')}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{t('checkout_success.firestore_error_desc')}</p>
            <p className="text-xs font-mono break-all opacity-90">{firestoreError}</p>
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button asChild variant="outline">
            <Link href="/account/orders">{t('account.sidebar_orders')}</Link>
          </Button>
          <Button asChild>
            <Link href="/contacto">{t('checkout_success.contact_link')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (timedOut && !isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 max-w-lg mx-auto px-4">
        <Alert className="text-left w-full border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>{t('checkout_success.timeout_alert_title')}</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{t('checkout_success.timeout_alert_desc')}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
              <Button asChild size="sm">
                <Link href="/account/orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t('account.sidebar_orders')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/contacto">{t('checkout_success.contact_link')}</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto px-4 gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <Alert className="text-left w-full">
          <Info className="h-4 w-4" />
          <AlertTitle>{t('checkout_success.verifying_alert_title')}</AlertTitle>
          <AlertDescription>
            {t('checkout_success.verifying_alert_desc')}
            <span className="block mt-2 text-muted-foreground text-sm">{t('checkout_success.verifying_keep_open')}</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-12 max-w-lg mx-auto px-4">
      <Card className="w-full">
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
