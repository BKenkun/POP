'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V1.1 - SOPORTE SUSCRIPCIONES)
 * Este archivo recibe las notificaciones de pago y activa el flag isSubscribed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

/**
 * Lógica para procesar el pago y activar la suscripción si corresponde.
 */
const handlePaidOrder = async (payload: any) => {
    const internalOrderId = payload.internalOrderId ?? payload.internal_order_id ?? payload.orderId;
    const eventType = payload.eventType ?? payload.event_type;
    const hilowOrderId = payload.hilowOrderId ?? payload.hilow_order_id ?? payload.hilowOrderID;

    console.log(`[WEBHOOK] Procesando pago: ${internalOrderId}. Evento: ${eventType}`);

    if (!internalOrderId || typeof internalOrderId !== 'string') {
        console.error('[WEBHOOK] internalOrderId no válido.');
        return;
    }

    // IDs soportados: CPO_uid_timestamp (compra) o SUB_uid_timestamp (suscripción)
    const parts = internalOrderId.split('_');
    if (parts.length < 3) {
        console.error(`❌ Error: ID de pedido inválido (${internalOrderId})`);
        return;
    }

    const prefix = parts[0];
    const userId = parts[1];
    const isSubscription = prefix === 'SUB';

    const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(internalOrderId);
    const userRef = adminFirestore.collection('users').doc(userId);
    
    try {
        const orderSnap = await orderRef.get();
        const batch = adminFirestore.batch();

        // 1. Si es suscripción, activamos al usuario inmediatamente
        if (isSubscription) {
          console.log(`[WEBHOOK] Activando suscripción para usuario: ${userId}`);
          batch.set(userRef, { 
            isSubscribed: true,
            lastSubscriptionPayment: FieldValue.serverTimestamp(),
            subscriptionStatus: 'active'
          }, { merge: true });
        }

        // 2. Si el documento de pedido existe, lo actualizamos
        if (orderSnap.exists) {
            const localOrderData = orderSnap.data() as Order;
            
            if (localOrderData.status === 'pending_payment') {
                batch.update(orderRef, { 
                    status: 'order_received',
                    paidAt: FieldValue.serverTimestamp(),
                    hilowPaymentId: hilowOrderId
                });

                // Sumar puntos (1 punto por cada 10€)
                const pointsToAdd = Math.floor((localOrderData.total || 0) / 1000);
                if (pointsToAdd > 0) {
                  batch.update(userRef, { loyaltyPoints: FieldValue.increment(pointsToAdd) });
                }

                await batch.commit();
                await trackOrderStatusUpdate({...localOrderData, id: internalOrderId, status: 'order_received'}, 'order_received');
            }
        } else {
            // Si el pedido no existía (común en suscripciones rápidas), guardamos un registro básico
            if (isSubscription) {
                batch.set(orderRef, {
                    userId,
                    total: 4400,
                    status: 'order_received',
                    paymentMethod: 'hilow',
                    createdAt: FieldValue.serverTimestamp(),
                    paidAt: FieldValue.serverTimestamp(),
                    hilowPaymentId: hilowOrderId,
                    isSubscription: true
                });
                await batch.commit();
                console.log(`✅ Suscripción activada y registro de pedido creado.`);
            }
        }

    } catch (error) {
        console.error("❌ Error procesando webhook:", error);
    }
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.HILOW_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Config Error' }, { status: 500 });
  }

  const headerStore = headers();
  const signature = headerStore.get('hilow-signature') ?? headerStore.get('x-hilow-signature');
  const body = await req.text();

  if (!signature) {
    return NextResponse.json({ error: 'Firma ausente' }, { status: 401 });
  }

  try {
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
    if (signature !== expectedSignature) throw new Error('Firma inválida');

    const payload = JSON.parse(body);
    const eventType = payload.eventType ?? payload.event_type;

    if (['payment.completed', 'payment.renewal_succeeded', 'payment.succeeded'].includes(eventType)) {
      await handlePaidOrder(payload);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error(`[WEBHOOK ERROR] ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
