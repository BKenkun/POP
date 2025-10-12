
'use server';

import 'server-only';
import { db } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { OrderSchema } from '@/lib/types';


// --- Data Processing Helper ---
function processFirestoreData<T>(data: any): T {
    if (!data) return data;

    // Convert Timestamps to serializable ISO strings
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        data.createdAt = data.createdAt.toDate().toISOString();
    }
    if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        data.updatedAt = data.updatedAt.toDate().toISOString();
    }
    
    return data as T;
}


// --- Server Actions ---

export async function getAllAdminOrders(): Promise<Order[]> {
    try {
        const ordersQuery = db.collectionGroup('orders');
        const ordersSnap = await ordersQuery.get();

        if (ordersSnap.empty) {
            console.log("No orders found in the database.");
            return [];
        }

        const orders: Order[] = [];
        ordersSnap.forEach(doc => {
            const rawData = doc.data();
            const processedData = processFirestoreData(rawData);
            
            // Re-add the ID and reconstruct the path for client-side updates
            const dataWithIdAndPath = {
                ...processedData,
                id: doc.id,
                path: doc.ref.path, 
            };

            const validation = OrderSchema.safeParse(dataWithIdAndPath);
            if(validation.success) {
                orders.push(validation.data);
            } else {
                console.warn(`[Admin Orders] Invalid order object filtered out. ID: ${doc.id}, Reason:`, validation.error.flatten());
            }
        });

        return orders;
    } catch (error) {
        console.error("❌ Critical error fetching orders from Firestore.", error);
        // Propagate error to be caught by Next.js error boundary.
        // This will display the `error.tsx` file to the user.
        throw new Error("Failed to fetch orders from database. Please check server logs.");
    }
}

export async function getAdminOrderById(orderId: string): Promise<Order | null> {
    try {
        const orderQuery = db.collectionGroup('orders').where('id', '==', orderId).limit(1);
        const orderSnap = await orderQuery.get();

        if (orderSnap.empty) {
            console.warn(`Order with ID ${orderId} not found.`);
            return null;
        }

        const orderDoc = orderSnap.docs[0];
        const rawData = orderDoc.data();
        const processedData = processFirestoreData(rawData);

        const orderWithPath = { 
            ...processedData, 
            id: orderDoc.id,
            path: orderDoc.ref.path,
        };

        const validation = OrderSchema.safeParse(orderWithPath);
        if (validation.success) {
            return validation.data;
        } else {
             console.error(`[Admin Order Detail] Invalid order object retrieved. ID: ${orderId}, Reason:`, validation.error.flatten());
             return null;
        }

    } catch (error) {
        console.error(`❌ Error fetching order ${orderId}:`, error);
        throw new Error(`Failed to fetch order ${orderId}.`);
    }
}

export async function updateOrderStatus(orderPath: string, newStatus: string): Promise<{success: boolean, error?: string}> {
    if (!orderPath || !newStatus) {
        return { success: false, error: 'La ruta del pedido y el nuevo estado son requeridos.' };
    }
    
    try {
        // Here we use the standard client SDK because this function is called from the client component.
        // The security rules should allow an admin to update any order.
        // To do this server-side, we would need a dedicated server action.
        // For simplicity, we assume rules allow this.
        
        // This is a placeholder as we can't import the client `db` here.
        // The actual update will be done with the client SDK in the component.
        // Let's create a real server-side update action.
        const docRef = db.doc(orderPath);
        await docRef.update({ status: newStatus });
        return { success: true };

    } catch (error: any) {
        console.error("Error al actualizar el estado del pedido:", error);
        return { success: false, error: error.message || 'Ocurrió un error desconocido.' };
    }
}

interface SafeCustomer {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    disabled: boolean;
    creationTime: string;
}

export async function getAllAdminCustomers(): Promise<SafeCustomer[]> {
    try {
        const auth = getAuth();
        const listUsersResult = await auth.listUsers();
        
        return listUsersResult.users.map((userRecord: UserRecord) => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            creationTime: userRecord.metadata.creationTime,
        }));
    } catch (error) {
        console.error('Error fetching users from Firebase Auth:', error);
        return [];
    }
}

