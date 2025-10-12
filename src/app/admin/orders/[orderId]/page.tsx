
import { db } from '@/lib/firebase-admin';
import { Order, OrderSchema } from '@/lib/types';
import OrderDetailsClient from './order-details-client';
import { notFound } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to convert Firestore Timestamps to serializable format (ISO strings)
// This is safe to use as it handles nested objects and arrays.
function processFirestoreData(data: { [key: string]: any }): any {
    if (!data) return data;
    const processedData: { [key:string]: any } = {};
    for (const key in data) {
        const value = data[key];
        if (value instanceof Timestamp) {
            // Convert Timestamp to ISO string for serialization
            processedData[key] = value.toDate().toISOString();
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            processedData[key] = processFirestoreData(value);
        } else {
            processedData[key] = value;
        }
    }
    return processedData;
}


// This function needs to be more robust for admin
async function getAdminOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) return null;

    try {
        // Since we don't know the user ID, we have to find the order across all users.
        const ordersQuery = db.collectionGroup('orders').where('id', '==', orderId);
        const querySnapshot = await ordersQuery.get();

        if (querySnapshot.empty) {
            console.warn(`[Admin Order Detail] No order found with ID: ${orderId}`);
            return null;
        }

        // Assuming order IDs are unique, there should be only one doc.
        const docSnap = querySnapshot.docs[0];
        const orderRaw = docSnap.data();
        const path = docSnap.ref.path;
        
        const processedData = processFirestoreData(orderRaw);
        
        // Let's ensure customer email is present. If not, fetch from auth.
        if (!processedData.customerEmail && processedData.userId) {
            try {
                const userRecord = await getAuth().getUser(processedData.userId);
                processedData.customerEmail = userRecord.email;
            } catch (authError) {
                console.error(`Could not fetch user email for order ${orderId}:`, authError);
            }
        }
        
        const serializableOrder = {
            ...processedData,
            id: docSnap.id,
            path: path,
        };

        const result = OrderSchema.safeParse(serializableOrder);
        if (result.success) {
            return result.data as Order;
        } else {
            console.warn(`[Admin Order Detail] Invalid order object fetched. ID: ${orderId}, Reason:`, result.error.flatten());
            return null;
        }

    } catch (error) {
        console.error(`❌ Critical error fetching order ${orderId}.`, error);
        return null;
    }
}

export default async function OrderDetailPage({ params }: { params: { orderId: string }}) {
    const orderId = params.orderId;
    
    const order = await getAdminOrderById(orderId);

    if (!order) {
        notFound();
    }
    
    return <OrderDetailsClient initialOrder={order} />;
}

    