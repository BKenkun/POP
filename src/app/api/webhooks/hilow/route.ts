'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V1.3 - ESPECIFICACIONES HILOW CONFIRMADAS)
 * Procesa la activación de suscripciones y pedidos basándose en internalOrderId persistente.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

/**
 * Procesa la lógica de negocio una vez validada la autenticidad de la petición.
 */
const handlePaidOrder = async (payload: any) => {
    // Hilow confirma que el campo es exactamente 'internalOrderId'
    const internalOrderId = payload.internalOrderId;
    const hilowOrderId = payload.hilowOrderId;
    const eventType = payload.eventType;

    console.log(`[WEBHOOK] Procesando pago: ${internalOrderId} (Evento: ${eventType})`);

    if (!internalOrderId || typeof internalOrderId !== 'string') {
        console.error('[WEBHOOK] Error: internalOrderId no encontrado o inválido.');
        return;
    }

    // El ID tiene el formato SUB_uid_timestamp o CPO_uid_timestamp
    const parts = internalOrderId.split('_');
    if (parts.length < 2) {
        console.error(`[WEBHOOK] Error: Formato de ID inválido: ${internalOrderId}`);
        return;
    }

    const prefix = parts[0];
    const userId = parts[1];
    const isSubscription = prefix === 'SUB';

    const userRef = adminFirestore.collection('users').doc(userId);
    const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(internalOrderId);
    
    try {
        const batch = adminFirestore.batch();
        let shouldCommit = false;

        // 1. LÓGICA DE SUSCRIPCIÓN (SIEMPRE QUE SEA PREFIJO SUB_)
        // Hilow confirma que tanto payment.completed como payment.renewal_succeeded son válidos.
        if (isSubscription) {
          console.log(`[WEBHOOK] Activando/Renovando Club para el usuario: ${userId}`);
          batch.set(userRef, { 
            isSubscribed: true,
            subscriptionStatus: 'active',
            lastSubscriptionPayment: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          }, { merge: true });
          shouldCommit = true;
        }

        // 2. LÓGICA DE ACTUALIZACIÓN DE PEDIDO
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
            const orderData = orderSnap.data() as Order;
            // Solo actualizamos si el estado actual permite transición a pagado
            if (orderData.status === 'pending_payment' || orderData.status === 'order_received') {
                batch.update(orderRef, { 
                    status: 'order_received',
                    paidAt: FieldValue.serverTimestamp(),
                    hilowPaymentId: hilowOrderId,
                    lastEventType: eventType
                });
                
                // Sumar puntos de fidelidad (1 punto por cada 10€)
                const totalAmount = orderData.total || payload.amountInCents || 0;
                const pointsToAdd = Math.floor(totalAmount / 1000);
                if (pointsToAdd > 0) {
                  batch.update(userRef, { 
                      loyaltyPoints: FieldValue.increment(pointsToAdd) 
                  });
                }
                shouldCommit = true;
            }
        } else if (isSubscription) {
            // Caso especial: El webhook llega antes de que el frontend cree el pedido
            // o es una renovación automática mensual.
            console.log(`[WEBHOOK] Creando registro de pedido para suscripción/renovación.`);
            batch.set(orderRef, {
                userId,
                id: internalOrderId,
                total: 4400,
                status: 'order_received',
                paymentMethod: 'hilow',
                createdAt: FieldValue.serverTimestamp(),
                paidAt: FieldValue.serverTimestamp(),
                isSubscription: true,
                customerEmail: payload.email || 'customer@hilow.com' // Si Hilow lo envía en el futuro
            });
            shouldCommit = true;
        }

        if (shouldCommit) {
            await batch.commit();
            console.log(`✅ Base de datos actualizada con éxito para ${internalOrderId}`);
            
            // Notificar a Klaviyo (Solo si el pedido existe para tener los datos de items)
            if (orderSnap.exists) {
                const updatedData = (await orderRef.get()).data() as Order;
                await trackOrderStatusUpdate({...updatedData, id: internalOrderId}, 'order_received');
            }
        } else {
            console.log(`[WEBHOOK] No se realizaron cambios (Pedido ya procesado o condiciones no cumplidas).`);
        }

    } catch (error) {
        console.error("❌ Error fatal procesando webhook:", error);
    }
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.HILOW_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
      console.error('[WEBHOOK ERROR] HILOW_WEBHOOK_SECRET no configurado.');
      return NextResponse.json({ error: 'Config Error' }, { status: 500 });
  }

  const headerStore = headers();
  const signature = headerStore.get('hilow-signature') ?? headerStore.get('x-hilow-signature');
  const body = await req.text();

  if (!signature) {
      console.error('[WEBHOOK ERROR] Firma ausente en la petición.');
      return NextResponse.json({ error: 'Firma ausente' }, { status: 401 });
  }

  try {
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
    
    if (signature !== expectedSignature) {
        console.error('[WEBHOOK ERROR] Firma inválida. Posible intento de suplantación.');
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const eventType = payload.eventType || payload.event_type;

    // Hilow confirma estos eventos para pagos exitosos
    const VALID_EVENTS = ['payment.completed', 'payment.renewal_succeeded', 'payment.succeeded'];

    if (VALID_EVENTS.includes(eventType)) {
      await handlePaidOrder(payload);
    } else {
      console.log(`[WEBHOOK] Ignorando evento no relevante: ${eventType}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (err: any) {
    console.error(`[WEBHOOK FATAL ERROR] ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}