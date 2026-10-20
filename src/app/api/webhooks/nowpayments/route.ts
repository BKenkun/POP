// Modificado por: Webmaster Freddy Poleo
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendOrderReceivedEmail } from '@/lib/mailjet';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import type { Order } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type JsonObject = Record<string, any>;

function sortDeep(value: any): any {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result: JsonObject, key) => {
      result[key] = sortDeep(value[key]);
      return result;
    }, {});
  }
  return value;
}

function validSignature(payload: JsonObject, received: string, secret: string): boolean {
  const expected = crypto.createHmac('sha512', secret)
    .update(JSON.stringify(sortDeep(payload)))
    .digest('hex');
  const a = Buffer.from(received.trim().toLowerCase(), 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getOrderRef(orderId: string) {
  const parts = orderId.split('_');
  if (parts.length < 3 || parts[0] !== 'CPO') return null;
  const timestamp = parts[parts.length - 1];
  const userId = parts.slice(1, -1).join('_');
  if (!userId || !/^\d+$/.test(timestamp)) return null;
  return firestore.collection('users').doc(userId).collection('orders').doc(orderId);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'nowpayments-webhook',
    configured: Boolean(process.env.NOWPAYMENTS_IPN_SECRET && process.env.NOWPAYMENTS_API_KEY),
    endpoint: '/api/webhooks/nowpayments',
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) {
    console.error('[NOWPAYMENTS IPN] Falta NOWPAYMENTS_IPN_SECRET.');
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 });
  }

  try {
    const rawBody = await req.text();
    let payload: JsonObject;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const signature = req.headers.get('x-nowpayments-sig');
    if (!signature || !validSignature(payload, signature, secret)) {
      console.warn('[NOWPAYMENTS IPN] Firma ausente o inválida.');
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }

    const orderId = String(payload.order_id || '').trim();
    const paymentStatus = String(payload.payment_status || '').toLowerCase().trim();
    const paymentId = payload.payment_id == null ? '' : String(payload.payment_id);
    const orderRef = getOrderRef(orderId);

    if (!orderRef) return NextResponse.json({ error: 'order_id no válido' }, { status: 400 });

    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      console.error('[NOWPAYMENTS IPN] Pedido no encontrado:', orderId);
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }
    const order = orderSnap.data()!;
    if (order.paymentMethod !== 'nowpayments') {
      return NextResponse.json({ error: 'El pedido no pertenece a NOWPayments' }, { status: 409 });
    }

    // Si NOWPayments incluye el importe en EUR, comprobamos que coincide con Firestore.
    if (payload.price_amount !== undefined && payload.price_amount !== null) {
      const receivedAmount = Number(payload.price_amount);
      const expectedAmount = Number(order.total) / 100;
      if (!Number.isFinite(receivedAmount) || Math.abs(receivedAmount - expectedAmount) > 0.02) {
        console.error('[NOWPAYMENTS IPN] Importe no coincide:', { orderId, receivedAmount, expectedAmount });
        return NextResponse.json({ error: 'Importe del pago no coincide' }, { status: 400 });
      }
    }

    await firestore.collection('webhookEvents').doc(`nowpayments_${paymentId || orderId}_${paymentStatus}`).set({
      provider: 'nowpayments',
      orderId,
      paymentId,
      paymentStatus,
      receivedAt: FieldValue.serverTimestamp(),
      payload,
    }, { merge: true });

    const paidStatuses = ['order_received', 'shipped', 'out_for_delivery', 'delivered'];
    if (paidStatuses.includes(String(order.status))) {
      return NextResponse.json({ received: true, processed: 'already_paid' });
    }

    if (paymentStatus === 'finished') {
      // Reclamar la confirmación en una transacción evita enviar el correo dos veces
      // si NOWPayments reintenta el mismo IPN simultáneamente.
      const shouldNotify = await firestore.runTransaction(async (transaction) => {
        const currentSnap = await transaction.get(orderRef);
        if (!currentSnap.exists) throw new Error('Pedido desapareció durante la confirmación.');
        const current = currentSnap.data()!;
        if (paidStatuses.includes(String(current.status))) return false;
        transaction.set(orderRef, {
          status: 'order_received',
          paymentMethod: 'nowpayments',
          nowpaymentsPaymentId: paymentId || null,
          nowpaymentsStatus: paymentStatus,
          paidAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        return true;
      });

      if (!shouldNotify) {
        return NextResponse.json({ received: true, processed: 'already_paid' });
      }

      const finalSnap = await orderRef.get();
      if (finalSnap.exists) {
        const finalOrder = { ...finalSnap.data(), id: orderId } as Order;
        const results = await Promise.allSettled([
          sendOrderReceivedEmail(finalOrder),
          trackOrderStatusUpdate(finalOrder, 'order_received'),
        ]);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error('[NOWPAYMENTS IPN] Notificación fallida:', {
              notification: index === 0 ? 'mailjet_order_confirmation' : 'klaviyo_order_status',
              orderId,
              error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            });
          } else if (result.value && typeof result.value === 'object' && 'success' in result.value && result.value.success === false) {
            console.error('[NOWPAYMENTS IPN] Proveedor de notificaciones devolvió error:', {
              notification: index === 0 ? 'mailjet_order_confirmation' : 'klaviyo_order_status',
              orderId,
              error: 'error' in result.value ? result.value.error : 'Error no especificado',
            });
          }
        });
      }
      return NextResponse.json({ received: true, processed: 'payment_finished' });
    }

    const failureStatuses = ['failed', 'expired', 'refunded'];
    if (failureStatuses.includes(paymentStatus)) {
      await orderRef.set({
        nowpaymentsPaymentId: paymentId || null,
        nowpaymentsStatus: paymentStatus,
        status: 'issue',
        paymentFailureAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return NextResponse.json({ received: true, processed: paymentStatus });
    }

    // waiting, confirming, confirmed, sending, partially_paid, etc. no son pago final.
    await orderRef.set({
      nowpaymentsPaymentId: paymentId || null,
      nowpaymentsStatus: paymentStatus || 'unknown',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return NextResponse.json({ received: true, processed: 'status_recorded' });
  } catch (error) {
    console.error('[NOWPAYMENTS IPN] Error procesando notificación:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
