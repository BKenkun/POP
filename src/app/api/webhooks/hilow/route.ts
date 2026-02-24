'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';
import { headers } from 'next/headers';


/**
 * BUSINESS LOGIC FOR THE STORE.
 * Updates the database and triggers post-payment actions.
 */
async function updateLocalOrder(internalOrderId: string, eventType: string, payload: any) {
    console.log("🔍 RECEIVED IN WEBHOOK:", internalOrderId);
    
    const parts = internalOrderId.split('_');
    if (parts.length < 3) {
        console.error(`Invalid order ID, could not extract user ID: ${internalOrderId}`);
        return;
    }
    const userId = parts[1];
    console.log("👤 USER ID EXTRACTED:", userId);

    const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(internalOrderId);
    console.log("📍 SEARCHING IN PATH:", orderRef.path);
    
    try {
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            console.error(`❌ ERROR: Document ${internalOrderId} DOES NOT exist in Firestore. Path: ${orderRef.path}`);
            return;
        }
        
        const localOrderData = orderSnap.data() as Order;
        
        // Use consistent English keys
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

        // Update coupon usage if applicable
        if ((localOrderData as any).coupon) {
          const couponCode = (localOrderData as any).coupon.code;
          const couponRef = adminFirestore.collection('coupons').doc(couponCode);
          batch.update(couponRef, { usageCount: FieldValue.increment(1) });
        }
        
        // Add loyalty points
        const pointsToAdd = Math.floor((localOrderData.total || 0) / 1000); // 1 point per 10€
        if (pointsToAdd > 0) {
          const userRef = adminFirestore.collection('users').doc(userId);
          batch.update(userRef, { 
            loyaltyPoints: FieldValue.increment(pointsToAdd) 
          });
        }
        
        await batch.commit();
        console.log(`✅ Order ${internalOrderId} updated to "${newStatus}"`);
        
        await trackOrderStatusUpdate({...localOrderData, id: internalOrderId, status: newStatus}, newStatus);

    } catch (error) {
        console.error("❌ FIREBASE ERROR:", error);
    }
}

/**
 * Handler for POST requests from Hilow.
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.HILOW_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CRITICAL: HILOW_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Server configuration incomplete.' }, { status: 500 });
  }
  
  const headerStore = headers();
  const signature = headerStore.get('hilow-signature');
  const body = await req.text();

  console.log("Incoming Hilow Webhook:", body);

  if (!signature) {
    return NextResponse.json({ error: 'Unauthorized request. Missing hilow-signature header.' }, { status: 401 });
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

      const signatureBuffer = new TextEncoder().encode(signature);
      const expectedSignatureBuffer = new TextEncoder().encode(expectedSignature);
      
      if (signatureBuffer.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
        throw new Error('Webhook signature is invalid.');
      }

    const payload = JSON.parse(body);
    const { eventType, internalOrderId } = payload;

    if (!internalOrderId || !eventType) {
        console.error('Invalid webhook payload: missing internalOrderId or eventType.', payload);
        return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
    }

    switch (eventType) {
      case 'payment.succeeded':
      case 'payment.completed':
      case 'payment.renewal_succeeded':
        await updateLocalOrder(internalOrderId, eventType, payload);
        break;
      default:
        console.warn(`Unhandled webhook event from Hilow: ${eventType}`);
    }

  } catch (err: any) {
    console.error(`Error processing Hilow webhook: ${err.message}`);
    const statusCode = err.message.includes('signature') ? 400 : 500;
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: statusCode });
  }

  return NextResponse.json({ received: true });
}
