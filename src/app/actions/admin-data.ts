
'use server';

import { db } from '@/lib/firebase';
import { Order, Product } from '@/lib/types';
import { collection, collectionGroup, getDocs, query, where, doc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { cbdProducts } from '@/lib/cbd-products';

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

export async function getAdminDashboardData() {
    // This check is now handled by the admin layout, so we can simplify this.
    // In a real-world scenario with more complex permissions, you'd verify
    // the user's token here using Firebase Admin SDK.
    return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: cbdProducts.length,
        recentOrders: [],
        topClients: [], 
        topProducts: [],
    };
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
        return {
            ...order,
            createdAt: toDateSafe(order.createdAt).toISOString(),
        } as Order;
    }

    return null;
}

export async function getAllAdminCustomers() {
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    
    const listUsersResult = await auth.listUsers(1000);
    const users = listUsersResult.users.map(userRecord => {
        return {
            uid: userRecord.uid,
            email: userRecord.email || 'No Email',
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            creationTime: userRecord.metadata.creationTime,
        };
    });
    return users;
}
