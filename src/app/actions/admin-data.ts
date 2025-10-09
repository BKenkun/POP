
'use server';

import { db } from '@/lib/firebase';
import { Order, Product } from '@/lib/types';
import { collection, collectionGroup, getDocs, query, where, doc, getDoc, orderBy, limit, Timestamp, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';


// This function is now isolated and safe to be called from a client component.
// It only interacts with the database and returns serializable data.
export async function updateOrderStatus(orderPath: string, newStatus: string): Promise<{success: boolean, error?: string}> {
    if (!orderPath || !newStatus) {
        return { success: false, error: 'Order path and new status are required.' };
    }
    
    // In a real app, you would add a check here to ensure the caller is an admin.
    // For now, we trust the client-side route protection.
    
    try {
        const docRef = doc(db, orderPath);
        await updateDoc(docRef, { status: newStatus });
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update order status:", error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}


export async function getAllAdminCustomers() {
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
