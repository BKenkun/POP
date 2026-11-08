// Modificado por: Webmaster Freddy Poleo

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdateInternal } from '@/lib/klaviyo-server';
import { sendOrderReceivedEmail, sendSubscriptionStatusEmail } from '@/lib/mailjet';
import { Order } from '@/lib/types';
import { createPacklinkShipmentDraft } from '@/lib/packlink-server';

// Route handlers need Node.js for crypto and Firebase Admin.
export const runtime = 'nodejs';

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
    const amountInCents = Number(payload.amountInCents ?? 0);

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
      const paidStatuses = ['order_received', 'shipped', 'out_for_delivery', 'delivered'];
      const completion = await adminFirestore.runTransaction(async (transaction) => {
        const orderSnapshot = await transaction.get(orderRef);
        const existingOrder = orderSnapshot.exists ? orderSnapshot.data()! : null;

        // A normal order must exist before the provider can confirm it.
        if (!existingOrder && !(eventType.includes('renewal') && isSubscription)) {
          return { processed: false as const, reason: 'not_found' as const };
        }

        if (existingOrder && paidStatuses.includes(String(existingOrder.status))) {
          return { processed: false as const, reason: 'already_paid' as const };
        }

        // When the provider supplies cents, they must exactly match the stored order total.
        if (existingOrder && payload.amountInCents !== undefined && payload.amountInCents !== null) {
          const receivedAmount = Number(payload.amountInCents);
          const expectedAmount = Number(existingOrder.total);
          if (
            !Number.isFinite(receivedAmount) ||
            !Number.isFinite(expectedAmount) ||
            Math.round(receivedAmount) !== Math.round(expectedAmount)
          ) {
            return { processed: false as const, reason: 'amount_mismatch' as const };
          }
        }

        const customerEmail = String(existingOrder?.customerEmail || payload.email || '').trim().toLowerCase();
        const customerName = String(existingOrder?.customerName || payload.customerName || 'Cliente').trim();

        const orderData: Record<string, any> = {
          status: 'order_received',
          paidAt: FieldValue.serverTimestamp(),
          hilowPaymentId: hilowOrderId,
          updatedAt: FieldValue.serverTimestamp(),
        };

        // Recurring subscription renewals may not have a pre-created order.
        if (!existingOrder && eventType.includes('renewal') && isSubscription) {
          const configuredRenewalTotal = Number(process.env.SUBSCRIPTION_PRICE_CENTS || 4400);\n          const renewalTotal = Number.isSafeInteger(configuredRenewalTotal) && configuredRenewalTotal > 0 ? configuredRenewalTotal : 4400;
          orderData.id = orderDocId;
          orderData.userId = userId;
          orderData.total = renewalTotal;
          orderData.paymentMethod = 'hilow';
          orderData.createdAt = FieldValue.serverTimestamp();
          orderData.isSubscription = true;
          orderData.customerEmail = customerEmail || 'member@comprarpopperonline.com';
          orderData.customerName = customerName || 'Cliente';
          orderData.items = [{
            productId: 'subscription_club',
            name: 'Club Dosis Mensual',
            price: renewalTotal,
            quantity: 1,
            imageUrl: 'https://picsum.photos/seed/sub/200/200',
          }];
        }

        if (existingOrder) {
          transaction.set(orderRef, orderData, { merge: true });
        } else {
          transaction.create(orderRef, orderData);
        }

        const userUpdate: Record<string, any> = {};
        if (isSubscription) {
          userUpdate.isSubscribed = true;
          userUpdate.subscriptionStatus = 'active';
          userUpdate.lastSubscriptionPayment = FieldValue.serverTimestamp();
          userUpdate.updatedAt = FieldValue.serverTimestamp();
        }

        // Guests do not have a loyalty account. Award points only once, in the same
        // transaction that claims the payment, to avoid duplicate increments on retries.
        const paidTotal = Number(existingOrder?.total || orderData.total || amountInCents || 0);
        const points = Math.floor(paidTotal / 1000);
        if (userId !== 'guest' && points > 0) {
          userUpdate.loyaltyPoints = FieldValue.increment(points);
        }
        if (Object.keys(userUpdate).length > 0) {
          transaction.set(userRef, userUpdate, { merge: true });
        }

        return {
          processed: true as const,
          reason: 'processed' as const,
          order: {
            ...(existingOrder || {}),
            ...orderData,
            id: orderDocId,
            userId,
            total: paidTotal,
            customerEmail,
            customerName,
            status: 'order_received',
            items: existingOrder?.items || orderData.items || [],
            isSubscription,
          } as Order,
        };
      });

      if (completion.reason === 'not_found') {
        console.error('[HILOW WEBHOOK] Pedido no encontrado:', { internalOrderId, userId, orderDocId });
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
      }
      if (completion.reason === 'already_paid') {
        console.log('[HILOW WEBHOOK] Confirmación duplicada ignorada:', { internalOrderId, orderDocId });
        return NextResponse.json({ received: true, processed: 'already_paid' }, { status: 200 });
      }
      if (completion.reason === 'amount_mismatch') {
        console.error('[HILOW WEBHOOK] Importe del pago no coincide:', { internalOrderId, orderDocId });
        return NextResponse.json({ error: 'Importe del pago no coincide' }, { status: 400 });
      }

      const finalOrder = completion.order;
      const notificationResults = await Promise.allSettled([
        trackOrderStatusUpdateInternal(finalOrder, 'order_received'),
        sendOrderReceivedEmail(finalOrder),
        ...(isSubscription ? [sendSubscriptionStatusEmail(finalOrder, 'active')] : []),
      ]);

      notificationResults.forEach((result, index) => {
        const notification = index === 0
          ? 'klaviyo_order_status'
          : index === 1
            ? 'mailjet_order_confirmation'
            : 'mailjet_subscription_status';

        if (result.status === 'rejected') {
          console.error('[HILOW WEBHOOK] Falló una notificación secundaria:', {
            notification,
            orderId: orderDocId,
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          });
          return;
        }

        if (result.value && typeof result.value === 'object' && 'success' in result.value && result.value.success === false) {
          console.error('[HILOW WEBHOOK] El proveedor no confirmó la notificación:', {
            notification,
            orderId: orderDocId,
            error: 'error' in result.value ? result.value.error : 'Error no especificado',
            status: 'status' in result.value ? result.value.status : undefined,
          });
        }
      });

      if (!isSubscription && prefix === 'CPO') {
        try {
          await createPacklinkShipmentDraft(orderDocId);
        } catch (error) {
          console.error('[PACKLINK] Pago confirmado; creación de envío pendiente:', {
            orderId: orderDocId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return NextResponse.json({ received: true, processed: 'payment_completed' }, { status: 200 });
    }

    if (isPaymentFailed(eventType)) {
      const failureResult = await adminFirestore.runTransaction(async (transaction) => {
        const orderSnapshot = await transaction.get(orderRef);
        const currentOrder = orderSnapshot.exists ? orderSnapshot.data()! : null;
        const paidStatuses = ['order_received', 'shipped', 'out_for_delivery', 'delivered'];

        // Ignore a late failure webhook if a successful payment was already recorded.
        if (currentOrder && paidStatuses.includes(String(currentOrder.status))) {
          return { status: 'already_paid' as const, order: currentOrder };
        }
        if (!currentOrder && !isSubscription) {
          return { status: 'not_found' as const, order: null };
        }

        if (currentOrder) {
          transaction.set(orderRef, {
            status: 'issue',
            paymentFailureAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }
        if (isSubscription) {
          transaction.set(userRef, {
            subscriptionStatus: 'past_due',
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }

        return { status: 'failed' as const, order: currentOrder };
      });

      if (failureResult.status === 'already_paid') {
        return NextResponse.json({ received: true, processed: 'already_paid' }, { status: 200 });
      }
      if (failureResult.status === 'not_found') {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
      }
      if (isSubscription && failureResult.order) {
        try {
          await sendSubscriptionStatusEmail(
            { ...failureResult.order, id: orderDocId } as Order,
            'past_due'
          );
        } catch (error) {
          console.error('[HILOW WEBHOOK] No se pudo enviar el aviso de suscripción:', error instanceof Error ? error.message : String(error));
        }
      }

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
