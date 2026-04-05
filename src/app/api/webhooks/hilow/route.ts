'use server';
/**
 * @fileoverview PLANTILLA: Recibir confirmación de pago (Webhook firmado).
 *
 * Instrucciones:
 * 1. Crea una ruta en tu API (ej: /app/api/webhooks/hilow/route.ts).
 * 2. Copia este código y configura HILOW_WEBHOOK_SECRET en tu .env.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

/**
 * Lógica para procesar el pedido una vez confirmado el pago.
 */
const handlePaidOrder = async (payload: any) => {
    const { internalOrderId, eventType, amountInCents, hilowOrderId } = payload;
    console.log(`[WEBHOOK] Pedido ${internalOrderId} (Hilow: ${hilowOrderId}) confirmado. Evento: ${eventType}`);
    
    const parts = internalOrderId.split('_');
    if (parts.length < 3) {
        console.error(`Invalid order ID format: ${internalOrderId}`);
        return;
    }
    const userId = parts[1];

    const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(internalOrderId);
    
    try {
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            console.error(`❌ ERROR: Document ${internalOrderId} DOES NOT exist in Firestore.`);
            return;
        }
        
        const localOrderData = orderSnap.data() as Order;
        
        if (localOrderData.status !== 'pending_payment') {
          console.log(`Order ${internalOrderId} already processed. Current status: ${localOrderData.status}`);
          return;
        }

        const newStatus = 'order_received';
        const batch = adminFirestore.batch();

        batch.update(orderRef, { 
            status: newStatus,
            paidAt: FieldValue.serverTimestamp()
        });

        // Add loyalty points
        const pointsToAdd = Math.floor((localOrderData.total || 0) / 1000); // 1 point per 10€
        if (pointsToAdd > 0) {
          const userRef = adminFirestore.collection('users').doc(userId);
          batch.update(userRef, { 
            loyaltyPoints: FieldValue.increment(pointsToAdd) 
          });
        }
        
        await batch.commit();
        console.log(`✅ Order ${internalOrderId} updated successfully to "${newStatus}"`);
        
        await trackOrderStatusUpdate({...localOrderData, id: internalOrderId, status: newStatus}, newStatus);

    } catch (error) {
        console.error("❌ FIREBASE WEBHOOK ERROR:", error);
    }
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.HILOW_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('HILOW_WEBHOOK_SECRET no configurado en el archivo .env');
    return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
  }

  const headerStore = await headers();
  const signature = headerStore.get('hilow-signature');
  const body = await req.text(); 

  if (!signature) {
    return NextResponse.json({ error: 'Firma ausente' }, { status: 401 });
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body) 
      .digest('hex');

    const signatureBuffer = new Uint8Array(Buffer.from(signature, 'hex'));
    const expectedSignatureBuffer = new Uint8Array(Buffer.from(expectedSignature, 'hex'));

    if (signatureBuffer.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      throw new Error('Firma de webhook inválida');
    }

    const payload = JSON.parse(body);
    
    switch (payload.eventType) {
      case 'payment.completed':
      case 'payment.renewal_succeeded':
      case 'payment.succeeded':
        await handlePaidOrder(payload);
        break;
      case 'subscription.cancelled':
        console.log(`Suscripción ${payload.internalOrderId} cancelada.`);
        break;
      default:
        console.log(`Evento Hilow no procesado: ${payload.eventType}`);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error(`Webhook Hilow Error: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
