// Modificado por: Webmaster Freddy Poleo

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAdminCredentialError, runWithAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue, type DocumentReference } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import {
  sendAdminNewOrderEmail,
  sendOrderReceivedEmail,
  sendSubscriptionStatusEmail,
} from '@/lib/mailjet';
import { Order } from '@/lib/types';
import { createPacklinkShipmentDraft } from '@/app/actions/packlink';

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

function parseAmountInCents(payload: Record<string, any>): number {
  if (payload.amountInCents !== undefined && payload.amountInCents !== null) {
    const val = Number(payload.amountInCents);
    return Number.isFinite(val) ? Math.round(val) : 0;
  }
  if (payload.amount !== undefined && payload.amount !== null) {
    const val = Number(payload.amount);
    if (!Number.isFinite(val)) return 0;
    // Si viene con decimales (ej. 4.47), convertir de euros a céntimos
    return Number.isInteger(val) ? val : Math.round(val * 100);
  }
  return 0;
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
    const amountInCents = parseAmountInCents(payload);

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

    console.log('[HILOW WEBHOOK] Evento recibido', {
      eventType,
      internalOrderId,
      userId,
      orderDocId,
      hilowOrderId,
      amountInCents,
    });

    // Registro de auditoría no bloqueante (si falla por formato de payload, no impide confirmar el pedido,
    // pero si falla por credenciales Admin SDK lo detectaremos igualmente al operar sobre el pedido).
    const safePayload = JSON.parse(JSON.stringify(payload));
    try {
      await runWithAdminFirestore(
        (db) =>
          db
            .collection('webhookEvents')
            .doc(`${internalOrderId}_${Date.now()}`)
            .set({
              provider: 'hilow',
              eventType,
              internalOrderId,
              hilowOrderId,
              amountInCents,
              receivedAt: FieldValue.serverTimestamp(),
              payload: safePayload,
            }),
        'hilow-webhook-audit'
      );
    } catch (auditErr) {
      if (isAdminCredentialError(auditErr)) {
        throw auditErr;
      }
      console.warn(
        '[HILOW WEBHOOK] No se pudo guardar registro en webhookEvents (continuando procesamiento):',
        auditErr instanceof Error ? auditErr.message : String(auditErr)
      );
    }

    if (isPaymentCompleted(eventType)) {
      const dbResult = await runWithAdminFirestore(async (adminFirestore) => {
        let resolvedUserId = userId;
        let userRef = adminFirestore.collection('users').doc(resolvedUserId);
        let orderRef: DocumentReference = userRef.collection('orders').doc(orderDocId);
        let orderSnap = await orderRef.get();

        // Si el documento no está en users/{userId}/orders/{orderDocId}, buscar en collectionGroup('orders')
        if (!orderSnap.exists) {
          try {
            const groupSnap = await adminFirestore
              .collectionGroup('orders')
              .where('id', '==', orderDocId)
              .limit(1)
              .get();
            if (!groupSnap.empty) {
              orderSnap = groupSnap.docs[0];
              orderRef = groupSnap.docs[0].ref;
              const parentUserDoc = orderRef.parent.parent;
              if (parentUserDoc) {
                resolvedUserId = parentUserDoc.id;
                userRef = parentUserDoc;
              }
            }
          } catch (groupErr) {
            console.warn(
              '[HILOW WEBHOOK] Búsqueda collectionGroup alternativa omitida:',
              groupErr instanceof Error ? groupErr.message : String(groupErr)
            );
          }
        }

        const existingOrder = orderSnap.exists ? orderSnap.data() : null;

        // Validar importe cuando el pedido existe y Hilow envía amountInCents explícito (tolerancia 1 céntimo)
        if (orderSnap.exists && payload.amountInCents !== undefined && payload.amountInCents !== null) {
          const receivedAmount = Number(payload.amountInCents);
          const expectedAmount = Number(existingOrder?.total);
          if (
            Number.isFinite(receivedAmount) &&
            receivedAmount > 0 &&
            Number.isFinite(expectedAmount) &&
            expectedAmount > 0 &&
            Math.abs(Math.round(receivedAmount) - Math.round(expectedAmount)) > 1
          ) {
            console.error('[HILOW WEBHOOK] Importe no coincide con el pedido:', {
              internalOrderId,
              receivedAmount,
              expectedAmount,
            });
            return { kind: 'amount_mismatch' as const };
          }
        }

        // Idempotencia: evita repetir puntos y correos si el webhook se reenvía tras estar ya confirmado
        const paidStatuses = ['order_received', 'shipped', 'out_for_delivery', 'delivered'];
        if (existingOrder?.status && paidStatuses.includes(String(existingOrder.status))) {
          return { kind: 'already_paid' as const, existingStatus: String(existingOrder.status) };
        }

        const customerEmail =
          payload.email || payload.customerEmail || existingOrder?.customerEmail || '';
        const customerName =
          payload.customerName || payload.name || existingOrder?.customerName || 'Cliente';

        const orderData: Record<string, any> = {
          status: 'order_received',
          paidAt: FieldValue.serverTimestamp(),
          hilowPaymentId: hilowOrderId,
          updatedAt: FieldValue.serverTimestamp(),
        };

        // Si el documento no existía previamente (renovación o compra cuyo guardado previo falló),
        // se reconstruye con merge para no perder jamás una venta cobrada y firmada por HMAC.
        if (!orderSnap.exists) {
          const fallbackTotal = amountInCents || (isSubscription ? 4400 : 0);
          const productLabel = String(
            payload.productName ||
              payload.description ||
              (isSubscription ? 'Club Dosis Mensual' : 'Pedido confirmado')
          );

          orderData.id = orderDocId;
          orderData.userId = resolvedUserId;
          orderData.isGuest = resolvedUserId === 'guest';
          orderData.total = fallbackTotal;
          orderData.shippingCost = 0;
          orderData.shippingFree = true;
          orderData.paymentMethod = 'hilow';
          orderData.createdAt = FieldValue.serverTimestamp();
          orderData.isSubscription = isSubscription;
          orderData.reconstructedFromWebhook = !eventType.includes('renewal');
          orderData.customerEmail = customerEmail || 'pendiente@comprarpopperonline.com';
          orderData.customerName = customerName;
          orderData.shippingAddress = existingOrder?.shippingAddress || {
            line1: payload.address || 'Dirección pendiente de confirmar',
            line2: null,
            city: payload.city || '-',
            state: payload.state || '-',
            postal_code: payload.postalCode || '00000',
            country: payload.country || 'ES',
            phone: payload.phone || '-',
          };
          orderData.items = [
            {
              productId: isSubscription ? 'subscription_club' : 'paid_order',
              name: productLabel,
              price: fallbackTotal,
              quantity: 1,
              imageUrl: 'https://picsum.photos/seed/order/200/200',
            },
          ];
        }

        await orderRef.set(orderData, { merge: true });

        if (isSubscription && resolvedUserId !== 'guest') {
          await userRef.set(
            {
              isSubscribed: true,
              subscriptionStatus: 'active',
              lastSubscriptionPayment: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        const points = Math.floor((amountInCents || Number(existingOrder?.total) || 0) / 1000);
        if (points > 0 && resolvedUserId !== 'guest') {
          await userRef.set({ loyaltyPoints: FieldValue.increment(points) }, { merge: true });
        }

        const finalSnap = await orderRef.get();
        const finalOrder = finalSnap.exists
          ? ({ ...finalSnap.data(), id: orderDocId, path: orderRef.path } as Order)
          : null;

        return { kind: 'updated' as const, finalOrder };
      }, 'hilow-webhook-payment-completed');

      if (dbResult.kind === 'amount_mismatch') {
        return NextResponse.json({ error: 'Importe del pago no coincide' }, { status: 400 });
      }

      if (dbResult.kind === 'already_paid') {
        console.log('[HILOW WEBHOOK] Confirmación duplicada ignorada:', {
          internalOrderId,
          orderDocId,
          status: dbResult.existingStatus,
        });
        return NextResponse.json({ received: true, processed: 'already_paid' }, { status: 200 });
      }

      if (dbResult.finalOrder) {
        const finalOrder = dbResult.finalOrder;
        const notificationTasks: Array<{ label: string; promise: Promise<unknown> }> = [
          { label: 'mailjet_admin_new_order', promise: sendAdminNewOrderEmail(finalOrder) },
        ];

        if (finalOrder.customerEmail) {
          notificationTasks.push(
            { label: 'order_status_tracking', promise: trackOrderStatusUpdate(finalOrder, 'order_received') },
            { label: 'mailjet_order_confirmation', promise: sendOrderReceivedEmail(finalOrder) }
          );
          if (isSubscription) {
            notificationTasks.push({
              label: 'mailjet_subscription_status',
              promise: sendSubscriptionStatusEmail(finalOrder, 'active'),
            });
          }
        }

        const notificationResults = await Promise.allSettled(
          notificationTasks.map((task) => task.promise)
        );

        notificationResults.forEach((result, index) => {
          const notification = notificationTasks[index]?.label || `notification_${index}`;

          if (result.status === 'rejected') {
            console.error('[HILOW WEBHOOK] Falló una notificación secundaria:', {
              notification,
              orderId: orderDocId,
              error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            });
            return;
          }

          if (
            result.value &&
            typeof result.value === 'object' &&
            'success' in result.value &&
            result.value.success === false
          ) {
            console.error('[HILOW WEBHOOK] El proveedor no confirmó la notificación:', {
              notification,
              orderId: orderDocId,
              error: 'error' in result.value ? result.value.error : 'Error no especificado',
              status: 'status' in result.value ? result.value.status : undefined,
            });
          } else {
            console.log('[HILOW WEBHOOK] Notificación procesada:', {
              notification,
              orderId: orderDocId,
              result: result.status,
            });
          }
        });
      }

      if (!isSubscription && prefix === 'CPO') {
        try {
          await createPacklinkShipmentDraft(orderDocId);
        } catch (error) {
          console.error('[SHIPPING] Pago confirmado; creación de envío pendiente:', {
            orderId: orderDocId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return NextResponse.json({ received: true, processed: 'payment_completed' }, { status: 200 });
    }

    if (isPaymentFailed(eventType)) {
      const failedOrder = await runWithAdminFirestore(async (adminFirestore) => {
        const userRef = adminFirestore.collection('users').doc(userId);
        const orderRef = userRef.collection('orders').doc(orderDocId);

        if (isSubscription && userId !== 'guest') {
          await userRef.set(
            {
              subscriptionStatus: 'past_due',
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        await orderRef.set(
          {
            status: 'issue',
            paymentFailureAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        if (isSubscription) {
          const orderSnap = await orderRef.get();
          return orderSnap.exists ? ({ ...orderSnap.data(), id: orderDocId } as Order) : null;
        }
        return null;
      }, 'hilow-webhook-payment-failed');

      if (failedOrder) {
        await sendSubscriptionStatusEmail(failedOrder, 'past_due').catch(() => undefined);
      }

      return NextResponse.json({ received: true, processed: 'payment_failed' }, { status: 200 });
    }

    if (isSubscriptionCancelled(eventType)) {
      const cancelledOrder = await runWithAdminFirestore(async (adminFirestore) => {
        const userRef = adminFirestore.collection('users').doc(userId);
        const orderRef = userRef.collection('orders').doc(orderDocId);

        if (userId !== 'guest') {
          await userRef.set(
            {
              isSubscribed: false,
              subscriptionStatus: 'cancelled',
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        const orderSnap = await orderRef.get();
        return orderSnap.exists ? ({ ...orderSnap.data(), id: orderDocId } as Order) : null;
      }, 'hilow-webhook-subscription-cancelled');

      if (cancelledOrder) {
        await sendSubscriptionStatusEmail(cancelledOrder, 'cancelled').catch(() => undefined);
      }

      return NextResponse.json({ received: true, processed: 'subscription_cancelled' }, { status: 200 });
    }

    console.warn('[HILOW WEBHOOK] Evento no mapeado:', eventType);
    return NextResponse.json({ received: true, processed: 'ignored_event', eventType }, { status: 200 });
  } catch (error: any) {
    const isAuthError = isAdminCredentialError(error);
    console.error('[HILOW WEBHOOK] Error crítico:', {
      category: isAuthError ? 'firebase_admin_credentials_invalid_or_revoked' : 'unexpected_runtime_error',
      code: error?.code,
      message: error?.message || String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
