
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { firestore } from '@/lib/firebase-admin';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import type { Order } from '@/lib/types';

const WEBHOOK_SECRET = process.env.INTERMEDIARY_WEBHOOK_SECRET;

async function findOrder(orderId: string): Promise<[FirebaseFirestore.DocumentReference | null, FirebaseFirestore.DocumentData | null]> {
    // We need to find the order without knowing the userId.
    // A collectionGroup query is the most efficient way to do this.
    // It requires a composite index on (`id`, `createdAt`) or similar in Firestore.
    // For now, we'll try to extract userId from the orderId if possible as a fallback.
    
    // Attempt 1: Collection Group Query
    try {
        const ordersRef = firestore.collectionGroup('orders');
        const querySnapshot = await ordersRef.where('id', '==', orderId).limit(1).get();

        if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            return [orderDoc.ref, orderDoc.data()];
        }
    } catch (e) {
        console.warn("Collection group query for orders failed. This likely requires a composite index to be created in Firestore. Falling back to parsing userId from orderId.", e);
    }
    
    // Attempt 2: Fallback by parsing userId from orderId
    // This assumes orderId is in format like `order_USERID_TIMESTAMP`
    const parts = orderId.split('_');
    if (parts.length >= 3 && parts[0] === 'order') {
        const userId = parts[1];
        const docRef = firestore.collection('users').doc(userId).collection('orders').doc(orderId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return [docRef, docSnap.data()!];
        }
    }

    return [null, null];
}


export async function POST(req: NextRequest) {
  const headersList = headers();
  const signature = headersList.get('x-intermediary-signature');

  if (!WEBHOOK_SECRET) {
    console.error('CRITICAL ERROR: INTERMEDIARY_WEBHOOK_SECRET is not set in the environment.');
    return NextResponse.json({ error: 'Webhook service is not configured.' }, { status: 500 });
  }

  const rawBody = await req.text();

  // 1. Verify the signature to ensure the request is legitimate
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('Invalid webhook signature received.');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);
    console.log('Webhook from intermediary verified successfully:', body);

    const { order_id, status, payment_id } = body;

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Missing required fields in payload.' }, { status: 400 });
    }
    
    // As the order might not exist yet, we can't easily find it.
    // For now, we will assume this webhook is for creation.
    // In a real app, you'd need a more robust way to handle this,
    // perhaps by storing pending transaction details temporarily.

    if (status === 'completed') {
        // This is where the logic to create the order should go.
        // However, we don't have the cart details here.
        // This implies the checkout success page MUST create the order with a 'pending' status,
        // and this webhook then UPDATES it to a 'paid' status.
        
        const [orderDocRef, currentOrderData] = await findOrder(order_id);

        if (!orderDocRef || !currentOrderData) {
            console.error(`Webhook received for non-existent order ID: ${order_id}`);
            return NextResponse.json({ success: true, message: 'Webhook received but order not found. It might be processed later.' });
        }
        
        // Prevent processing a webhook twice or updating a non-pending order
        if (currentOrderData.status !== 'Pago Pendiente de Verificación') {
            console.log(`Order ${order_id} has already been processed. Current status: ${currentOrderData.status}`);
            return NextResponse.json({ success: true, message: 'Webhook already processed.' });
        }

        await orderDocRef.update({
            status: 'Reserva Recibida',
            paymentId: payment_id,
            updatedAt: new Date().toISOString(),
        });

        console.log(`Order ${order_id} successfully updated to status: Reserva Recibida`);
        
        // Send Klaviyo confirmation email
        const klaviyoOrderData = await formatOrderForKlaviyo({ ...currentOrderData, id: order_id } as Order, order_id);
        await trackKlaviyoEvent('Placed Order', currentOrderData.customerEmail, klaviyoOrderData);
        
    } else {
        // Handle 'failed' or 'expired' statuses
        const [orderDocRef] = await findOrder(order_id);
        if (orderDocRef) {
            await orderDocRef.update({
                status: 'Cancelado',
                updatedAt: new Date().toISOString(),
            });
            console.log(`Order ${order_id} status updated to: Cancelado`);
        }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error processing payment webhook:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
