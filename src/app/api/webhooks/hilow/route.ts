'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V1.0 FINAL)
 * Este archivo recibe las notificaciones automáticas de pago de Hilow.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

/**
 * Lógica para procesar el pedido una vez confirmado el pago por Hilow.
 */
const handlePaidOrder = async (payload: any) => {
    const { internalOrderId, eventType, hilowOrderId } = payload;
    console.log(`[WEBHOOK] Procesando pedido: ${internalOrderId}. Evento: ${eventType}`);
    
    // El ID tiene el formato CPO_uid_timestamp
    const parts = internalOrderId.split('_');
    if (parts.length < 3) {
        console.error(`❌ Error: Formato de ID de pedido inválido (${internalOrderId})`);
        return;
    }
    const userId = parts[1];

    // Referencia al pedido en la subcolección del usuario
    const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(internalOrderId);
    
    try {
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            console.error(`❌ Error: El pedido ${internalOrderId} no existe en Firestore.`);
            return;
        }
        
        const localOrderData = orderSnap.data() as Order;
        
        // Evitamos procesar dos veces el mismo pedido
        if (localOrderData.status !== 'pending_payment') {
          console.log(`[WEBHOOK] El pedido ${internalOrderId} ya estaba procesado. Estado actual: ${localOrderData.status}`);
          return;
        }

        const newStatus = 'order_received';
        const batch = adminFirestore.batch();

        // 1. Actualizar estado del pedido
        batch.update(orderRef, { 
            status: newStatus,
            paidAt: FieldValue.serverTimestamp(),
            hilowPaymentId: hilowOrderId
        });

        // 2. Sumar puntos de fidelidad (1 punto por cada 10€)
        const pointsToAdd = Math.floor((localOrderData.total || 0) / 1000);
        if (pointsToAdd > 0) {
          const userRef = adminFirestore.collection('users').doc(userId);
          batch.update(userRef, { 
            loyaltyPoints: FieldValue.increment(pointsToAdd) 
          });
        }
        
        await batch.commit();
        console.log(`✅ Pedido ${internalOrderId} confirmado y actualizado a "${newStatus}"`);
        
        // 3. Notificar a Klaviyo (Cliente y Admin)
        await trackOrderStatusUpdate({...localOrderData, id: internalOrderId, status: newStatus}, newStatus);

    } catch (error) {
        console.error("❌ Error interno procesando el webhook:", error);
    }
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.HILOW_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('HILOW_WEBHOOK_SECRET no está configurado en las variables de entorno.');
    return NextResponse.json({ error: 'Config Error' }, { status: 500 });
  }

  const headerStore = headers();
  const signature = headerStore.get('hilow-signature');
  const body = await req.text(); 

  if (!signature) {
    return NextResponse.json({ error: 'Firma ausente' }, { status: 401 });
  }

  try {
    // Verificación de la firma HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body) 
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      throw new Error('Firma de webhook inválida');
    }

    const payload = JSON.parse(body);
    
    // Solo procesamos eventos de éxito de pago
    switch (payload.eventType) {
      case 'payment.completed':
      case 'payment.renewal_succeeded':
      case 'payment.succeeded':
        await handlePaidOrder(payload);
        break;
      default:
        console.log(`[WEBHOOK] Evento recibido no procesable: ${payload.eventType}`);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error(`[WEBHOOK ERROR] ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}