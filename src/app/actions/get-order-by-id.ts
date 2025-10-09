'use server'

import { db } from '@/lib/firebase';
import { Order } from '@/lib/types';
import { collectionGroup, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// Helper function to safely get a Date object from Firestore Timestamp, string or other types.
const toDateSafe = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date(0); // Return epoch for null/undefined to avoid crashes
  }
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'string') {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  if (typeof timestamp === 'object' && timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
   if (typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }
  console.warn("Could not parse timestamp, returning epoch:", timestamp);
  return new Date(0);
}


export async function getAdminOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) return null;

    let order: Order | null = null;
    let path: string | null = null;

    // Search in 'orders' collection group first
    const ordersQuery = query(collectionGroup(db, 'orders'), where('id', '==', orderId));
    const orderSnap = await getDocs(ordersQuery);
    
    if (!orderSnap.empty) {
        // Found in a user's subcollection
        path = orderSnap.docs[0].ref.path;
        const docSnap = await getDoc(orderSnap.docs[0].ref);
        if (docSnap.exists()) {
             order = docSnap.data() as Order;
             order.path = path;
        }
    } else {
        // If not found, check the 'reservations' collection for guest orders
        const reservationRef = doc(db, 'reservations', orderId);
        const reservationSnap = await getDoc(reservationRef);
        if (reservationSnap.exists()) {
            order = reservationSnap.data() as Order;
            order.path = reservationRef.path;
        }
    }

    if (order) {
        // Convert to a plain JavaScript object and ensure date is a string
        return {
            ...order,
            createdAt: toDateSafe(order.createdAt).toISOString(),
        } as Order;
    }

    return null;
}
