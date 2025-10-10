
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, collectionGroup, query } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { UserRecord } from 'firebase-admin/auth';

// Esta función es segura porque solo toma strings y no devuelve objetos complejos.
export async function updateOrderStatus(orderPath: string, newStatus: string): Promise<{success: boolean, error?: string}> {
    if (!orderPath || !newStatus) {
        return { success: false, error: 'La ruta del pedido y el nuevo estado son requeridos.' };
    }
    
    try {
        const docRef = doc(db, orderPath);
        await updateDoc(docRef, { status: newStatus });
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

// Esta función se ejecuta en el servidor y devuelve datos serializados seguros.
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
            creationTime: userRecord.metadata.creationTime, // Esto ya es un string ISO
        }));
    } catch (error) {
        console.error('Error fetching users from Firebase Auth:', error);
        // En caso de error, devuelve un array vacío para no romper el cliente.
        return [];
    }
}
