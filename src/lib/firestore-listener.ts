
'use server';

import { firestore } from './firebase-admin';
import { serverTimestamp, increment } from 'firebase-admin/firestore';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

const STORE_ID = 'comprarpopperonline_com';
const COLLECTION_PATH = `portals/${STORE_ID}/orders`;

console.log(`[FirestoreListener] Setting up listener for collection: ${COLLECTION_PATH}`);

const ordersCollection = firestore.collection(COLLECTION_PATH);

const unsubscribe = ordersCollection.onSnapshot(
  (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      // We only care about modifications, specifically status changes
      if (change.type === 'modified') {
        const orderData = change.doc.data();
        const orderId = change.doc.id;

        console.log(`[FirestoreListener] Detected change in order: ${orderId}`);

        // If the status is now 'completed', process the order
        if (orderData.status === 'completed') {
          console.log(`[FirestoreListener] Order ${orderId} has been completed. Processing...`);
          await processCompletedOrder(orderId);
        }
      }
    });
  },
  (error) => {
    console.error('[FirestoreListener] Error listening to collection:', error);
  }
);

async function processCompletedOrder(orderId: string) {
  // The user ID is part of the orderId, e.g., "order_USERID_TIMESTAMP"
  const parts = orderId.split('_');
  if (parts.length < 2 || parts[0] !== 'order') {
    console.error(`[FirestoreListener] Could not extract userId from order_id: ${orderId}`);
    return;
  }
  const userId = parts[1];

  const orderRef = firestore.collection('users').doc(userId).collection('orders').doc(orderId);

  try {
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      console.error(`[FirestoreListener] Order ${orderId} not found in our local Firestore. Cannot update.`);
      return;
    }

    const localOrderData = orderSnap.data() as Order;

    // Check if the order is still in a pending state before updating
    if (localOrderData.status !== 'Pago Pendiente de Verificación') {
      console.log(`[FirestoreListener] Local order ${orderId} status is already '${localOrderData.status}'. Ignoring update.`);
      return;
    }

    // Update the local order status
    await orderRef.update({ status: 'Reserva Recibida' });
    console.log(`[FirestoreListener] Successfully updated local order ${orderId} to 'Reserva Recibida'.`);
    
    // --- Perform post-payment actions ---
    const batch = firestore.batch();
    
    // 1. Increment coupon usage if a coupon was applied
    if (localOrderData.coupon) {
      // Assuming coupon ID is its code
      const couponRef = firestore.collection('coupons').doc(localOrderData.coupon.code);
      batch.update(couponRef, { usageCount: increment(1) });
    }

    // 2. Add loyalty points
    const pointsToAdd = Math.floor(localOrderData.total / 1000); // 1 point per 10€
    if (pointsToAdd > 0) {
      const userRef = firestore.collection('users').doc(userId);
      batch.update(userRef, { loyaltyPoints: increment(pointsToAdd) });
    }
    
    await batch.commit();
    console.log(`[FirestoreListener] Processed loyalty points and coupon usage for order ${orderId}.`);

    // 3. Send confirmation emails via Klaviyo
    const klaviyoOrderData = await formatOrderForKlaviyo({ ...localOrderData, id: orderId, createdAt: new Date(localOrderData.createdAt as any) }, orderId);
    await trackKlaviyoEvent('Placed Order', localOrderData.customerEmail, klaviyoOrderData);
    await trackKlaviyoEvent('Admin New Order Notification', 'maryandpopper@gmail.com', klaviyoOrderData);
    console.log(`[FirestoreListener] Sent Klaviyo notifications for order ${orderId}.`);

  } catch (error) {
    console.error(`[FirestoreListener] Error processing completed order ${orderId}:`, error);
  }
}

// Keep the server process alive. In some environments, top-level async operations
// might not be awaited indefinitely. This ensures our listener stays active.
process.on('SIGTERM', () => {
    console.log('[FirestoreListener] SIGTERM signal received. Shutting down listener.');
    unsubscribe();
});
