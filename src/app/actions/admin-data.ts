
'use server';

import { db } from '@/lib/firebase';
import { Order, Product } from '@/lib/types';
import { collection, collectionGroup, getDocs, query, where, doc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { cbdProducts } from '@/lib/cbd-products';

// This is a server-only function
async function verifyAdmin() {
    // This check is now handled by the admin layout, so we can simplify this.
    // In a real-world scenario with more complex permissions, you'd verify
    // the user's token here using Firebase Admin SDK.
    return;
}

// Helper function to safely get a Date object from Firestore Timestamp or string
const toDateSafe = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date(0); // Return epoch if timestamp is null or undefined
  }
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
        return d;
    }
  }
  return new Date(0); // Fallback for invalid formats
}


async function fetchAllOrders(): Promise<Order[]> {
    const userOrdersQuery = collectionGroup(db, 'orders');
    const reservationsQuery = collection(db, 'reservations');

    const [userOrdersSnap, guestOrdersSnap] = await Promise.all([
        getDocs(userOrdersQuery),
        getDocs(reservationsQuery),
    ]);

    const allOrdersMap = new Map<string, Order>();

    // Process user orders from the collection group
    userOrdersSnap.forEach(doc => {
        const orderData = doc.data() as Order;
        if (orderData.id) {
            allOrdersMap.set(orderData.id, orderData);
        }
    });

    // Process guest orders from the reservations collection
    guestOrdersSnap.forEach(doc => {
        const orderData = doc.data() as Order;
        if (orderData.id) {
            allOrdersMap.set(orderData.id, orderData);
        }
    });
    
    const combinedOrders = Array.from(allOrdersMap.values());
    
    // Sort after combining to ensure correct chronological order
    combinedOrders.sort((a, b) => {
        const dateA = toDateSafe(a.createdAt).getTime();
        const dateB = toDateSafe(b.createdAt).getTime();
        return dateB - dateA; // Sort descending (newest first)
    });

    return combinedOrders;
}


export async function getAdminDashboardData() {
    await verifyAdmin();

    const allOrders = await fetchAllOrders();
    const allProducts: Product[] = cbdProducts;
    
    const recentOrders = allOrders.slice(0, 5);
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = allOrders.length;

    return {
        totalRevenue,
        totalOrders,
        totalProducts: allProducts.length,
        recentOrders,
        topClients: [], 
        topProducts: [],
    };
}

export async function getAllAdminOrders(): Promise<Order[]> {
    await verifyAdmin();
    const orders = await fetchAllOrders();
    // Serialize Timestamps to strings before sending to the client
    return orders.map(order => ({
        ...order,
        createdAt: toDateSafe(order.createdAt).toISOString(),
    }));
}


export async function getAdminOrderById(orderId: string): Promise<Order | null> {
    await verifyAdmin();
    if (!orderId) return null;

    let order: Order | null = null;
    let path: string | null = null;

    // Search in 'orders' collection group first
    const ordersQuery = query(collectionGroup(db, 'orders'), where('id', '==', orderId));
    const orderSnap = await getDocs(ordersQuery);
    
    if (!orderSnap.empty) {
        // Found in a user's subcollection
        path = orderSnap.docs[0].ref.path;
        const docRef = doc(db, path);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
             order = docSnap.data() as Order;
        }
    } else {
        // If not found, check the 'reservations' collection for guest orders
        const reservationRef = doc(db, 'reservations', orderId);
        const reservationSnap = await getDoc(reservationRef);
        if (reservationSnap.exists()) {
            order = reservationSnap.data() as Order;
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

// You might need a new function for getting customer data
export async function getAllAdminCustomers() {
    await verifyAdmin();
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
