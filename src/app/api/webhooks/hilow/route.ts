'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { sendOrderReceivedEmail, sendSubscriptionStatusEmail } from '@/lib/mailjet';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

function normalizeSignature(value: string) {
  return value.trim().replace(/^sha256=/i, '').trim();
}

function safeSignatureEqual(received: string, expected: string) {
  const a = Buffer.from(normalizeSignature(received), 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getEventType(payload: Record<string, any>) {
  return String(payload.eventType || payload.event || payload.type || '').toLowerCase().trim();
}

function isPaymentCompleted(eventType: string) {
  return [
    'payment.completed',
    'payment.succeeded',
    'payment.success',
    'payment.renewal_succeeded',
    'payment.renewed',
  ].includes(eventType);
}

function isPaymentFailed(eventType: string) {
  return ['payment.failed', 'payment.failure', 'payment.error'].includes(eventType);
}

function isSubscriptionCancelled(eventType: string) {
  return ['subscription.cancelled', 'subscription.canceled'].includes(eventType);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'hilow-webhook',
    configured: Boolean(process.env.HILOW_WEBHOOK_SECRET && process.env.HILOW_API_KEY),
    endpoint: '/api/webhooks/hilow',
  });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.HILOW_WEBHOOK_SECRET;
  const signature = req.headers.get('hilow-signature') || req.headers.get('x-hilow-signature');
  const body = await req.text();

  if (!webhookSecret) {
    console.error('[HILOW WEBHOOK] HILOW_WEBHOOK_SECRET no está configurado.');
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 });
  }

  if (!signature) {
    console.error('[HILOW WEBHOOK] Falta firma.');
    return NextResponse.json({ error: 'Firma ausente' }, { status: 401 });
  }

  try {
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

    if (!safeSignatureEqual(signature, expectedSignature)) {
      console.error('[HILOW WEBHOOK] Firma inválida.');
      return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
    }

    const payload = JSON.parse(body) as Record<string, any>;
    const eventType = getEventType(payload);
    const internalOrderId = String(payload.internalOrderId || payload.orderId || '').trim();
    const hilowOrderId = payload.hilowOrderId || payload.paymentId || payload.id || null;
    const amountInCents = Number(payload.amountInCents ?? payload.amount ?? 0);

    if (!internalOrderId) {
      return NextResponse.json({ error: 'internalOrderId no válido' }, { status: 400 });
    }

    if (!eventType) {
      return NextResponse.json({ error: 'eventType no válido' }, { status: 400 });
    }

    // IDs actuales:
    // CPO_<userId>_<timestamp>
    // SUB_<userId>_<BOX-orderId>_<timestamp>
    const parts = internalOrderId.split('_');
    const prefix = parts[0];
    const isSubscription = prefix === 'SUB';

    let userId = '';
    let orderDocId = internalOrderId;

    if (isSubscription) {
      orderDocId = parts.length >= 4 ? parts[parts.length - 2] : '';
      userId = parts.slice(1, parts.length - 2).join('_');
    } else if (prefix === 'CPO') {
      userId = parts.slice(1, -1).join('_');
    }

    if (!userId || !orderDocId) {
      console.error('[HILOW WEBHOOK] No se pudo interpretar internalOrderId:', internalOrderId);
      return NextResponse.json({ error: 'internalOrderId no compatible' }, { status: 400 });
    }

    const userRef = adminFirestore.collection('users').doc(userId);
    const orderRef = userRef.collection('orders').doc(orderDocId);

    console.log('[HILOW WEBHOOK] Evento recibido', {
      eventType,
      internalOrderId,
      userId,
      orderDocId,
      hilowOrderId,
      amountInCents,
    });

    // Guardamos una copia del evento para poder diagnosticar cualquier problema
    // sin depender únicamente de los logs del proveedor de pagos.
    const eventRef = adminFirestore
      .collection('webhookEvents')
      .doc(`${internalOrderId}_${Date.now()}`);

    await eventRef.set({
      provider: 'hilow',
      eventType,
      internalOrderId,
      hilowOrderId,
      amountInCents,
      receivedAt: FieldValue.serverTimestamp(),
      payload,
    });

    if (isPaymentCompleted(eventType)) {
      const orderSnap = await orderRef.get();

      const existingOrder = orderSnap.exists ? orderSnap.data() : null;
      const customerEmail = payload.email || existingOrder?.customerEmail || '';
      const customerName = payload.customerName || existingOrder?.customerName || 'Cliente';

      const orderData: Record<string, any> = {
        status: 'order_received',
        paidAt: FieldValue.serverTimestamp(),
        hilowPaymentId: hilowOrderId,
        updatedAt: FieldValue.serverTimestamp(),
      };

      // Una renovación puede llegar sin un documento de pedido previamente creado.
      if (eventType.includes('renewal') && !orderSnap.exists) {
        orderData.id = orderDocId;
        orderData.userId = userId;
        orderData.total = amountInCents || 4400;
        orderData.paymentMethod = 'hilow';
        orderData.createdAt = FieldValue.serverTimestamp();
        orderData.isSubscription = true;
        orderData.customerEmail = customerEmail || 'member@comprarpopperonline.com';
        orderData.customerName = customerName;
        orderData.items = [{
          productId: 'subscription_club',
          name: 'Club Dosis Mensual',
          price: amountInCents || 4400,
          quantity: 1,
          imageUrl: 'https://picsum.photos/seed/sub/200/200',
        }];
      }

      await orderRef.set(orderData, { merge: true });

      if (isSubscription) {
        await userRef.set({
          isSubscribed: true,
          subscriptionStatus: 'active',
          lastSubscriptionPayment: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      const points = Math.floor((amountInCents || Number(existingOrder?.total) || 0) / 1000);
      if (points > 0) {
        await userRef.set({ loyaltyPoints: FieldValue.increment(points) }, { merge: true });
      }

      const finalSnap = await orderRef.get();
      if (finalSnap.exists) {
        const finalOrder = { ...finalSnap.data(), id: orderDocId } as Order;

        // Estos envíos son secundarios: si Mailjet/Klaviyo falla, el webhook sigue
        // devolviendo 200 porque el pago ya quedó registrado en Firestore.
        await Promise.allSettled([
          trackOrderStatusUpdate(finalOrder, 'order_received'),
          sendOrderReceivedEmail(finalOrder),
          ...(isSubscription ? [sendSubscriptionStatusEmail(finalOrder, 'active')] : []),
        ]);
      }

      return NextResponse.json({ received: true, processed: 'payment_completed' }, { status: 200 });
    }

    if (isPaymentFailed(eventType)) {
      if (isSubscription) {
        await userRef.set({
          subscriptionStatus: 'past_due',
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
          await sendSubscriptionStatusEmail({ ...orderSnap.data(), id: orderDocId } as Order, 'past_due');
        }
      }

      await orderRef.set({
        status: 'issue',
        paymentFailureAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      return NextResponse.json({ received: true, processed: 'payment_failed' }, { status: 200 });
    }

    if (isSubscriptionCancelled(eventType)) {
      await userRef.set({
        isSubscribed: false,
        subscriptionStatus: 'cancelled',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      const orderSnap = await orderRef.get();
      if (orderSnap.exists) {
        await sendSubscriptionStatusEmail({ ...orderSnap.data(), id: orderDocId } as Order, 'cancelled');
      }

      return NextResponse.json({ received: true, processed: 'subscription_cancelled' }, { status: 200 });
    }

    // Evento desconocido: se guarda arriba para diagnóstico y se responde 200
    // para evitar reintentos infinitos de Hilow.
    console.warn('[HILOW WEBHOOK] Evento no mapeado:', eventType);
    return NextResponse.json({ received: true, processed: 'ignored_event', eventType }, { status: 200 });
  } catch (error: any) {
    console.error('[HILOW WEBHOOK] Error crítico:', error?.message || error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
