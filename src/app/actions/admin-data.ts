
'use server';

import { auth, firestore } from '@/lib/firebase-admin';
import { getUserIdFromSession } from './user-data';
import type { Order, Customer } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Checks if the current user is an admin. Throws an error if not.
 * This is the primary security gate for all admin server actions.
 */
async function verifyAdmin() {
    const userId = await getUserIdFromSession();
    const user = await auth.getUser(userId);
    if (user.email !== 'maryandpopper@gmail.com') {
        throw new Error('Permission denied: User is not an admin.');
    }
    return user;
}


export async function getAllOrders(): Promise<Order[]> {
    await verifyAdmin();
    try {
        const ordersSnapshot = await firestore.collectionGroup('orders').orderBy('createdAt', 'desc').get();
        const orders: Order[] = ordersSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
            
            return {
                id: doc.id,
                path: doc.ref.path,
                ...data,
                 createdAt, // Ensure it's a serializable Date object
            } as Order;
        });
        return orders;
    } catch (error) {
        console.error("Error fetching all orders:", error);
        return [];
    }
}

export async function getAllCustomers(): Promise<Customer[]> {
     await verifyAdmin();
    try {
        const listUsersResult = await auth.listUsers();
        const customers: Customer[] = listUsersResult.users.map(userRecord => {
             const creationTime = userRecord.metadata.creationTime;
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                disabled: userRecord.disabled,
                 creationTime: new Date(creationTime).toISOString(), // Make serializable
            };
        });
        return customers;
    } catch (error) {
        console.error("Error fetching all customers:", error);
        return [];
    }
}

export async function getOrderById(orderId: string, orderPath: string): Promise<Order | null> {
    await verifyAdmin();
     if (!orderPath || !orderId) return null;

    try {
        const orderDocRef = firestore.doc(decodeURIComponent(orderPath));
        const docSnap = await orderDocRef.get();

        if (!docSnap.exists) {
            return null;
        }

        const orderData = docSnap.data()!;
        const createdAt = orderData.createdAt instanceof Timestamp ? orderData.createdAt.toDate() : new Date();

        return {
            id: docSnap.id,
            path: docSnap.ref.path,
            ...orderData,
            createdAt,
        } as Order;

    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return null;
    }
}
