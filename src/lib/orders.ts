
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Order, OrderItem, ShippingAddress } from './types';
import type Stripe from 'stripe';

/**
 * Creates an order in Firestore from a Stripe Checkout Session.
 * @param session - The Stripe Checkout Session object.
 * @param lineItems - The line items from the Stripe session.
 */
export async function createOrder(session: Stripe.Checkout.Session, lineItems: Stripe.LineItem[]): Promise<void> {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('Error: No userId found in Stripe session metadata.');
    throw new Error('User ID is missing, cannot create order.');
  }
  
  const orderId = session.id;

  const orderItems: OrderItem[] = lineItems.map((item) => {
    const product = item.price?.product as Stripe.Product;
    return {
      productId: product.id,
      name: product.name,
      price: item.price?.unit_amount || 0,
      quantity: item.quantity || 0,
      imageUrl: product.images?.[0] || '',
    };
  });
  
  const shippingDetails = session.shipping_details;
  const shippingAddress: ShippingAddress | null = shippingDetails?.address
    ? {
        line1: shippingDetails.address.line1,
        line2: shippingDetails.address.line2,
        city: shippingDetails.address.city,
        state: shippingDetails.address.state,
        postal_code: shippingDetails.address.postal_code,
        country: shippingDetails.address.country,
      }
    : null;


  const orderData: Order = {
    id: orderId,
    userId: userId,
    createdAt: new Date(), // Will be converted to Firestore timestamp on save
    status: 'pending',
    total: session.amount_total || 0,
    items: orderItems,
    customerName: shippingDetails?.name || session.customer_details?.name || 'N/A',
    customerEmail: session.customer_details?.email || 'N/A',
    shippingAddress: shippingAddress,
  };

  try {
    const userOrdersRef = collection(db, 'users', userId, 'orders');
    await setDoc(doc(userOrdersRef, orderId), {
        ...orderData,
        createdAt: serverTimestamp() // Use server-side timestamp
    });
    console.log(`✅ Order ${orderId} created successfully for user ${userId}.`);
  } catch (error) {
    console.error(`❌ Failed to create order ${orderId} for user ${userId}:`, error);
    // Optionally, re-throw the error to be handled by the caller (e.g., the webhook)
    throw error;
  }
}
