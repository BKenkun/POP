'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V1.2 - FIX ACTIVACIÓN SUSCRIPCIÓN)
 * Asegura que el flag isSubscribed se active siempre, independientemente del estado del pedido.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

const handlePaidOrder = async (payload: any) => {
    const internalOrderId = payload.internalOrderId ?? payload.internal_order_id ?? payload.orderId;
    const hilowOrderId = payload.hilowOrderId ?? payload.hilow_order_id ?? payload.hilowOrderID;

    console.log(`[WEBHOOK] Procesando pago: ${internalOrderId}`);

    if (!internalOrderId || typeof internalOrderId !== 'string') return;

    const parts = internalOrderId.split('_');
    if (parts.length < 3) return;

    const prefix = parts[0];
    const userId = parts[1];
    const isSubscription = prefix === 'SUB';

    const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(internalOrderId);
    const userRef = adminFirestore.collection('users').doc(userId);
    
    try {
        const batch = adminFirestore.batch();
        let shouldCommit = false;

        // 1. Lógica de Suscripción (Prioritaria)
        if (isSubscription) {
          console.log(`[WEBHOOK] Activando flag de suscriptor para: ${userId}`);
          batch.set(userRef, { 
            isSubscribed: true,
            lastSubscriptionPayment: FieldValue.serverTimestamp(),
            subscriptionStatus: 'active'
          }, { merge: true });
          shouldCommit = true;
        }

        // 2. Lógica de Pedido
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
            const orderData = orderSnap.data() as Order;
            if (orderData.status === 'pending_payment') {
                batch.update(orderRef, { 
                    status: 'order_received',
                    paidAt: FieldValue.serverTimestamp(),
                    hilowPaymentId: hilowOrderId
                });
                
                const pointsToAdd = Math.floor((orderData.total || 0) / 1000);
                if (pointsToAdd > 0) {
                  batch.update(userRef, { loyaltyPoints: FieldValue.increment(pointsToAdd) });
                }
                shouldCommit = true;
            }
        } else if (isSubscription) {
            // Crear registro de pedido si no existe (flujo rápido)
            batch.set(orderRef, {
                userId,
                total: 4400,
                status: 'order_received',
                paymentMethod: 'hilow',
                createdAt: FieldValue.serverTimestamp(),
                paidAt: FieldValue.serverTimestamp(),
                isSubscription: true
            });
            shouldCommit = true;
        }

        if (shouldCommit) {
            await batch.commit();
            console.log(`✅ Base de datos actualizada para ${internalOrderId}`);
            
            // Notificación opcional (solo si tenemos datos del pedido)
            if (orderSnap.exists) {
                const updatedData = (await orderRef.get()).data() as Order;
                await trackOrderStatusUpdate({...updatedData, id: internalOrderId}, 'order_received');
            }
        }

    } catch (error) {
        console.error("❌ Error procesando webhook:", error);
    }
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.HILOW_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: 'Config Error' }, { status: 500 });

  const headerStore = headers();
  const signature = headerStore.get('hilow-signature') ?? headerStore.get('x-hilow-signature');
  const body = await req.text();

  if (!signature) return NextResponse.json({ error: 'Firma ausente' }, { status: 401 });

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