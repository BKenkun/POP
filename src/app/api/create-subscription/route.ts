import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PRICE_CENTS = Number(process.env.SUBSCRIPTION_PRICE_CENTS ?? '4400');
const APP_BASE_URL = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');

async function applySubscriptionRateLimit(uid: string): Promise<void> {
  const key = crypto.createHash('sha256').update(uid).digest('hex').slice(0, 40);
  const ref = adminFirestore.collection('securityRateLimits').doc('subscription_' + key);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 3;

  await adminFirestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.exists ? snapshot.data()! : {};
    const windowStart = Number(data.windowStartMs || 0);
    const count = Number(data.count || 0);

    if (now - windowStart < windowMs && count >= maxRequests) {
      throw new Error('Has alcanzado el límite de intentos. Vuelve a intentarlo más tarde.');
    }

    const reset = now - windowStart >= windowMs;
    transaction.set(ref, {
      windowStartMs: reset ? now : windowStart || now,
      count: reset ? 1 : count + 1,
      updatedAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(now + 24 * windowMs),
    });
  });
}

/**
 * Subscription checkout. Identity, price and return URLs are derived on the server.
 */
export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization') || '';
    const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);
    if (!tokenMatch) {
      return NextResponse.json({ error: 'Debes iniciar sesión para contratar la suscripción.' }, { status: 401 });
    }

    let claims;
    try {
      claims = await admin.auth().verifyIdToken(tokenMatch[1], true);
    } catch {
      return NextResponse.json({ error: 'La sesión ha caducado. Inicia sesión de nuevo.' }, { status: 401 });
    }

    if (!Number.isSafeInteger(PRICE_CENTS) || PRICE_CENTS <= 0) {
      console.error('[SUBSCRIPTION] SUBSCRIPTION_PRICE_CENTS no es válido.');
      return NextResponse.json({ error: 'La suscripción no está configurada correctamente.' }, { status: 503 });
    }
    if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(APP_BASE_URL)) {
      console.error('[SUBSCRIPTION] APP_BASE_URL no es válido.');
      return NextResponse.json({ error: 'La URL de la tienda no está configurada correctamente.' }, { status: 503 });
    }

    const apiKey = process.env.HILOW_API_KEY;
    const storeId = process.env.HILOW_STORE_ID || 'comprarpopperonline.com';
    if (!apiKey) {
      console.error('[SUBSCRIPTION] HILOW_API_KEY no está configurada.');
      return NextResponse.json({ error: 'La pasarela de pago no está disponible.' }, { status: 503 });
    }

    const userId = claims.uid;
    await applySubscriptionRateLimit(userId);

    const userRef = adminFirestore.collection('users').doc(userId);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
      return NextResponse.json({ error: 'No se encontró el perfil de usuario.' }, { status: 404 });
    }

    const userData = userSnapshot.data()!;
    if (userData.isSubscribed === true || userData.subscriptionStatus === 'active' ||
        userData.subscription?.status === 'active') {
      return NextResponse.json({ error: 'Ya tienes una suscripción activa.' }, { status: 409 });
    }

    const customerEmail = String(claims.email || userData.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Tu cuenta necesita un correo electrónico válido.' }, { status: 400 });
    }

    const customerName = String(userData.displayName || claims.name || customerEmail.split('@')[0]).trim();
    const uniqueOrderId = 'BOX-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    const orderRef = userRef.collection('orders').doc(uniqueOrderId);
    const structuredInternalOrderId = 'SUB_' + userId + '_' + uniqueOrderId + '_' + Date.now();

    await orderRef.create({
      id: uniqueOrderId,
      userId,
      status: 'pending_payment',
      total: PRICE_CENTS,
      paymentMethod: 'hilow',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isSubscription: true,
      customerEmail,
      customerName,
      items: [{
        productId: 'subscription_club',
        name: 'Club Dosis Mensual',
        price: PRICE_CENTS,
        quantity: 1,
        imageUrl: 'https://picsum.photos/seed/sub/200/200',
      }],
    });

    const payload = {
      storeId,
      internalOrderId: structuredInternalOrderId,
      amountInCents: PRICE_CENTS,
      productName: 'Club Dosis Mensual',
      isSubscription: true,
      successUrl: APP_BASE_URL + '/subscription/success?order_id=' + encodeURIComponent(uniqueOrderId),
      cancelUrl: APP_BASE_URL + '/subscription',
    };

    let response: Response;
    try {
      response = await fetch('https://hilowglobal.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
    } catch (error) {
      await orderRef.set({
        paymentInitError: 'No se pudo contactar con HiLow.',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      throw error;
    }

    const responseText = await response.text();
    let result: { hilowOrderId?: string; message?: string } = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = {};
    }

    if (!response.ok || typeof result.hilowOrderId !== 'string' || !result.hilowOrderId) {
      await orderRef.set({
        paymentInitError: 'HiLow devolvió un error al crear el pago.',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      console.error('[SUBSCRIPTION] HiLow rechazó el alta del pago:', { status: response.status });
      return NextResponse.json({ error: result.message || 'No se pudo iniciar el pago de la suscripción.' }, { status: 502 });
    }

    const checkoutUrl = 'https://hilowglobal.com/pay/' + encodeURIComponent(result.hilowOrderId);
    await orderRef.set({
      hilowOrderId: result.hilowOrderId,
      hilowCheckoutUrl: checkoutUrl,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ success: true, checkoutUrl, orderId: uniqueOrderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno al procesar la suscripción.';
    if (message.includes('límite de intentos')) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    console.error('[SUBSCRIPTION] Error al crear la suscripción:', message);
    return NextResponse.json({ error: 'No se pudo iniciar la suscripción.' }, { status: 500 });
  }
}
