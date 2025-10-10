
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, collectionGroup, query } from 'firebase/firestore';

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

// Se elimina getAllAdminCustomers de este archivo para evitar conflictos.
// La lógica se moverá a un componente de servidor.
