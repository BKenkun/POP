
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import type { Order, OrderItem, ShippingAddress } from './types';

/**
 * Creates an order in Firestore.
 * This version is independent of Stripe and can be used with any payment flow.
 */
export async function createOrder(orderData: Omit<Order, 'createdAt' | 'id'>, orderId: string): Promise<void> {
  const { userId } = orderData;

  if (!userId) {
    console.error('Error: No userId provided for order creation.');
    throw new Error('User ID is required to create an order.');
  }

  try {
    const userOrdersRef = collection(db, 'users', userId, 'orders');
    await setDoc(doc(userOrdersRef, orderId), {
      ...orderData,
      id: orderId,
      createdAt: serverTimestamp(), // Use server-side timestamp for accuracy
    });
    console.log(`✅ Order ${orderId} created successfully for user ${userId}.`);
  } catch (error) {
    console.error(`❌ Failed to create order ${orderId} for user ${userId}:`, error);
    throw error; // Re-throw to indicate failure
  }
}

/**
 * Updates a user's loyalty points.
 * @param userId The ID of the user.
 * @param pointsToAdd The number of points to add. Can be negative to subtract points.
 */
export async function updateUserLoyaltyPoints(userId: string, pointsToAdd: number): Promise<void> {
  if (!userId || pointsToAdd === 0) return;

  const userDocRef = doc(db, 'users', userId);

  try {
    await updateDoc(userDocRef, {
      loyaltyPoints: increment(pointsToAdd),
    });
    console.log(`✅ Awarded ${pointsToAdd} loyalty points to user ${userId}.`);
  } catch (error) {
    console.error(`❌ Failed to update loyalty points for user ${userId}:`, error);
  }
}
