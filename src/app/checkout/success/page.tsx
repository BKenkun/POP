'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { Loader2, CheckCircle, ShoppingBag, User, AlertCircle, Info, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getCheckoutOrderStatus } from '@/app/actions/checkout';

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
  const [guestOrderInfo, setGuestOrderInfo] = useState<{
    customerName?: string;
    customerEmail?: string;
    total?: number;
  } | null>(null);
  const [guestAccessToken, setGuestAccessToken] = useState('');
  const clearedRef = useRef(false);

  const isGuestOrder = Boolean(
    orderId && (orderId.includes('_guest_') || orderId.startsWith('CPO_guest_'))
  );

  useEffect(() => {
    if (!orderId) {
      router.replace('/');
    }
  }, [orderId, router]);

  // Guest orders are accessed with a one-time capability token, not by guessing an order ID.
  useEffect(() => {
    if (!orderId || !isGuestOrder) return;
    try {
      const saved = sessionStorage.getItem('pop_guest_order_access');
      if (!saved) return;
      const parsed = JSON.parse(saved) as { orderId?: string; token?: string };
      if (parsed.orderId === orderId && typeof parsed.token === 'string') {
        setGuestAccessToken(parsed.token);
      }
    } catch (error) {
      console.warn('[checkout/success] No se pudo recuperar el acceso del pedido de invitado.', error);
    }
  }, [orderId, isGuestOrder]);

  // Listener para pedidos de usuario registrado en Firestore
  useEffect(() => {
    if (!orderId || isGuestOrder || !user || authLoading) return;

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
  }, [orderId, isGuestOrder, user, authLoading, clearCart]);

  // Polling para pedidos de invitados o cuando no hay sesión activa
  useEffect(() => {
    if (!orderId || isConfirmed) return;
    if (!isGuestOrder && user) return; // Si es usuario autenticado, el listener directo ya se encarga

    let active = true;

    const checkStatus = async () => {
      try {
        if (isGuestOrder && !guestAccessToken) return;
        const idToken = user ? await user.getIdToken() : undefined;
        const result = await getCheckoutOrderStatus(orderId, idToken, guestAccessToken || undefined);
        if (!active) return;
        if (result.exists) {
          if (result.customerName || result.customerEmail) {
            setGuestOrderInfo({
              customerName: result.customerName,
              customerEmail: result.customerEmail,
              total: result.total,
            });
          }
          if (result.status === 'order_received') {
            if (!clearedRef.current) {
              clearedRef.current = true;
              clearCart();
            }
            setIsConfirmed(true);
          }
        }
      } catch (err) {
        console.warn('[checkout/success] Polling order status error:', err);
      }
    };

    // Consulta inicial inmediata
    void checkStatus();

    // Intervalo de comprobación cada 3 segundos
    const interval = window.setInterval(() => {
      if (!isConfirmed && active) {
        void checkStatus();
      }
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [orderId, isGuestOrder, user, isConfirmed, clearCart, guestAccessToken]);

  useEffect(() => {
    if (!orderId || authLoading || isConfirmed) return;

    const timer = window.setTimeout(() => {
      setTimedOut(true);
    }, PAYMENT_CONFIRM_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [orderId, authLoading, isConfirmed]);

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

  useEffect(() => {
    if (!isConfirmed || !isGuestOrder) return;
    try {
      const saved = sessionStorage.getItem('pop_guest_order_access');
      if (saved) {
        const parsed = JSON.parse(saved) as { orderId?: string };
        if (parsed.orderId === orderId) sessionStorage.removeItem('pop_guest_order_access');
      }
    } catch {
      // Ignore sessionStorage cleanup failures; the order is already confirmed.
    }
  }, [isConfirmed, isGuestOrder, orderId]);

  // Si no es un pedido de invitado pero no hay usuario logueado, pedir login
  if (!user && !isGuestOrder) {
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

  if (firestoreError && !isConfirmed && !isGuestOrder) {
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
              {!isGuestOrder && (
                <Button asChild size="sm">
                  <Link href="/account/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {t('account.sidebar_orders')}
                  </Link>
                </Button>
              )}
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

  const customerDisplayName = guestOrderInfo?.customerName || user?.displayName || user?.email?.split('@')[0] || 'cliente';

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-12 max-w-lg mx-auto px-4">
      <Card className="w-full">
        <CardHeader className="items-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary font-bold">¡Pago Completado!</CardTitle>
          <CardDescription className="text-lg text-foreground/80">
            Gracias por tu compra, {customerDisplayName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Hemos recibido tu pago correctamente. El pedido <span className="font-mono font-semibold text-foreground">#{orderId.substring(orderId.length - 8).toUpperCase()}</span> está confirmado y en preparación. Recibirás un correo con todos los detalles.
          </p>

          {isGuestOrder && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-left space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>¿Quieres acumular puntos en tus próximos pedidos?</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Has realizado este pedido como invitado. Si creas una cuenta ahora, podrás guardar tus direcciones, seguir envíos fácilmente y acumular puntos de fidelidad con descuentos para tus compras futuras.
              </p>
              <Button asChild size="sm" variant="default" className="w-full">
                <Link href={`/register?email=${encodeURIComponent(guestOrderInfo?.customerEmail || '')}`}>
                  Crear mi cuenta ahora <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            {!isGuestOrder ? (
              <>
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
              </>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link href="/products">
                  <ShoppingBag className="mr-2" />
                  Volver a la tienda
                </Link>
              </Button>
            )}
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
