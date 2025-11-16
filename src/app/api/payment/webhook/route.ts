
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase-admin';
import { doc, getDoc, setDoc, writeBatch, increment } from 'firebase-admin/firestore';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { Order, ShippingAddress, OrderItem } from '@/lib/types';
import { z } from 'zod';

const EXTERNAL_WEBHOOK_SECRET = process.env.EXTERNAL_WEBHOOK_SECRET;

// Define a schema for the expected webhook payload from the intermediary
const WebhookPayloadSchema = z.object({
  order_id: z.string(),
  status: z.enum(['completed', 'expired']),
  // The original payload we sent to the purchase endpoint, now returned to us
  originalPayload: z.object({
      userId: z.string(),
      total: z.number(),
      items: z.array(z.object({
          productId: z.string(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
          imageUrl: z.string().url(),
      })),
      customerName: z.string(),
      customerEmail: z.string().email(),
      shippingAddress: z.object({
          line1: z.string(),
          line2: z.string().nullable(),
          city: z.string(),
          state: z.string(),
          postal_code: z.string(),
          country: z.string(),
          phone: z.string(),
      }),
      coupon: z.object({
          code: z.string(),
          discount: z.number(),
      }).nullable(),
  }),
});


export async function POST(req: NextRequest) {
  if (!EXTERNAL_WEBHOOK_SECRET) {
    console.error('La clave secreta del webhook no está configurada en las variables de entorno.');
    return NextResponse.json({ error: 'Error de configuración del servidor.' }, { status: 500 });
  }

  const rawBody = await req.text();
  const receivedSignature = req.headers.get('x-intermediary-signature');

  // 1. Verificar la firma HMAC
  const expectedSignature = crypto
    .createHmac('sha256', EXTERNAL_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    console.warn('Firma de webhook inválida. Alerta de seguridad.');
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  try {
    // We need to parse the body now to access the nested JSON string
    const webhookData = JSON.parse(rawBody);

    // The `originalPayload` comes as a string, so we need to parse it too.
    const fullPayload = {
      ...webhookData,
      originalPayload: JSON.parse(webhookData.originalPayload)
    }

    const validation = WebhookPayloadSchema.safeParse(fullPayload);

    if (!validation.success) {
      console.error("Invalid webhook payload:", validation.error.flatten());
      return NextResponse.json({ error: 'Payload de webhook inválido.' }, { status: 400 });
    }
    
    const { order_id, status, originalPayload } = validation.data;
    const { userId, total, items, customerName, customerEmail, shippingAddress, coupon } = originalPayload;

    if (status === 'completed') {
      console.log(`Webhook recibido: Pago completado para el pedido ${order_id}`);
      
      const orderRef = db.collection('users').doc(userId).collection('orders').doc(order_id);
      const orderSnap = await orderRef.get();

      if (orderSnap.exists) {
        console.log(`El pedido ${order_id} ya fue procesado. Ignorando webhook.`);
        return NextResponse.json({ received: true, message: 'Pedido ya procesado.' });
      }
      
      // Build the final order data
      const orderData: Omit<Order, 'id' | 'createdAt'> = {
        userId,
        status: 'Reserva Recibida',
        total,
        items: items as OrderItem[],
        customerName,
        customerEmail,
        shippingAddress: shippingAddress as ShippingAddress,
        paymentMethod: 'stripe',
        createdAt: new Date(), // This will be replaced by serverTimestamp, but needed for type
        ...(coupon && { coupon: { code: coupon.code, discount: coupon.discount } })
      };

      const batch = db.batch();
      
      // 1. Set the order document with a server-generated timestamp
      batch.set(orderRef, { ...orderData, createdAt: admin.firestore.FieldValue.serverTimestamp() });

      // 2. Increment coupon usage count if a coupon was applied
      if (coupon) {
          const couponRef = db.collection('coupons').doc(coupon.code);
          batch.update(couponRef, { usageCount: admin.firestore.FieldValue.increment(1) });
      }

      // 3. Add loyalty points
      const pointsToAdd = Math.floor(total / 1000); // 1 point per 10€
      if (pointsToAdd > 0) {
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, { loyaltyPoints: admin.firestore.FieldValue.increment(pointsToAdd) });
      }
      
      // Commit all database operations
      await batch.commit();

      // Send confirmation emails via Klaviyo
      const klaviyoOrderData = await formatOrderForKlaviyo({ ...orderData, id: order_id, createdAt: new Date() }, order_id);
      await trackKlaviyoEvent('Placed Order', customerEmail, klaviyoOrderData);
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
