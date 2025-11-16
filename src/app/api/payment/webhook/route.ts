'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase-admin';
import { doc, getDoc, updateDoc, writeBatch, increment, serverTimestamp } from 'firebase-admin/firestore';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';
import { z } from 'zod';

const EXTERNAL_WEBHOOK_SECRET = process.env.EXTERNAL_WEBHOOK_SECRET;

// Simplified schema to match the new "contract"
const WebhookPayloadSchema = z.object({
  order_id: z.string(),
  status: z.enum(['completed', 'expired']),
  // No metadata is expected anymore according to the new spec
});


export async function POST(req: NextRequest) {
  if (!EXTERNAL_WEBHOOK_SECRET) {
    console.error('La clave secreta del webhook no está configurada en las variables de entorno.');
    return NextResponse.json({ error: 'Error de configuración del servidor.' }, { status: 500 });
  }

  const rawBody = await req.text();
  const receivedSignature = req.headers.get('x-intermediary-signature');

  // 1. Verify the HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', EXTERNAL_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    console.warn('Firma de webhook inválida. Alerta de seguridad.');
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  try {
    const webhookData = JSON.parse(rawBody);
    const validation = WebhookPayloadSchema.safeParse(webhookData);

    if (!validation.success) {
      console.error("Invalid webhook payload:", validation.error.flatten());
      return NextResponse.json({ error: 'Payload de webhook inválido.' }, { status: 400 });
    }
    
    const { order_id, status } = validation.data;

    if (status === 'completed') {
      console.log(`Webhook recibido: Pago completado para el pedido ${order_id}`);
      
      // Since metadata is gone, we need to find the user ID from the order ID format
      const userId = order_id.split('_')[1];
      if (!userId) {
        throw new Error(`Could not extract userId from order_id: ${order_id}`);
      }

      const orderRef = db.collection('users').doc(userId).collection('orders').doc(order_id);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
          console.error(`Webhook for order ${order_id} received, but order not found in Firestore.`);
          // Still return 200 to avoid retries, but log the error.
          return NextResponse.json({ received: true, message: 'Pedido no encontrado, pero webhook aceptado.' });
      }

      const orderData = orderSnap.data() as Order;
      
      // Check if order is already processed
      if (orderData.status !== 'Pago Pendiente de Verificación') {
          console.log(`El pedido ${order_id} ya fue procesado. Estado actual: ${orderData.status}. Ignorando webhook.`);
          return NextResponse.json({ received: true, message: 'Pedido ya procesado.' });
      }
      
      const batch = db.batch();
      
      // 1. Update the order status
      batch.update(orderRef, { status: 'Reserva Recibida' });

      // 2. Increment coupon usage if a coupon was applied
      if (orderData.coupon) {
          const couponRef = db.collection('coupons').doc(orderData.coupon.code);
          const couponSnap = await couponRef.get();
          if(couponSnap.exists()) {
              batch.update(couponRef, { usageCount: increment(1) });
          }
      }

      // 3. Add loyalty points
      const pointsToAdd = Math.floor(orderData.total / 1000); // 1 point per 10€
      if (pointsToAdd > 0) {
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, { loyaltyPoints: increment(pointsToAdd) });
      }
      
      // Commit all database operations
      await batch.commit();

      // Send confirmation emails via Klaviyo
      const klaviyoOrderData = await formatOrderForKlaviyo({ ...orderData, id: order_id }, order_id);
      await trackKlaviyoEvent('Placed Order', orderData.customerEmail, klaviyoOrderData);
      await trackKlaviyoEvent('Admin New Order Notification', 'maryandpopper@gmail.com', klaviyoOrderData);
      
    } else {
      console.log(`Webhook recibido para el pedido ${order_id} con estado: ${status}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error procesando el webhook:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
