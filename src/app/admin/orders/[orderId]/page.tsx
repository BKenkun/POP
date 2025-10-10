
import { db } from '@/lib/firebase';
import { doc, getDoc, collectionGroup, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Order, OrderSchema } from '@/lib/types';
import OrderDetailsClient from './order-details-client';
import { notFound } from 'next/navigation';

// Helper to convert Firestore Timestamps to JS Date objects
function processFirestoreData(data: { [key: string]: any }): any {
  const processedData: { [key: string]: any } = {};
  for (const key in data) {
    const value = data[key];
    if (value instanceof Timestamp) {
      processedData[key] = value.toDate(); // Convert Timestamp to JS Date
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      processedData[key] = processFirestoreData(value); // Recursively process nested objects
    } else {
      processedData[key] = value;
    }
  }
  return processedData;
}

async function getAdminOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) return null;

    let orderRaw: any | null = null;
    let path: string | null = null;

    try {
        // This is the most efficient way to find a document when you don't know its full path.
        // It requires a composite index on the 'orders' collection group.
        // If the index is missing, Firestore will log an error in the console with a link to create it.
        const ordersQuery = query(collectionGroup(db, 'orders'), where('id', '==', orderId));
        const orderSnap = await getDocs(ordersQuery);
        
        if (!orderSnap.empty) {
            const docSnap = orderSnap.docs[0];
            orderRaw = docSnap.data();
            path = docSnap.ref.path;
        } else {
            // Fallback to check reservations if not found in user orders
            const reservationRef = doc(db, 'reservations', orderId);
            const reservationSnap = await getDoc(reservationRef);
            if (reservationSnap.exists()) {
                orderRaw = reservationSnap.data();
                path = reservationRef.path;
            }
        }
    } catch (error) {
        console.error(`❌ Critical error fetching order ${orderId} from Firestore. This might be due to a missing composite index for the 'orders' collection group.`, error);
        return null;
    }


    if (orderRaw) {
        const processedData = processFirestoreData(orderRaw);

        const sanitizedOrder = {
            ...processedData,
            // Ensure the ID from the URL param is used if the doc data doesn't have one
            id: processedData.id || orderId,
            path: path,
        };

        const result = OrderSchema.safeParse(sanitizedOrder);
        if (result.success) {
            return result.data as Order;
        } else {
            console.warn(`[Admin Order Detail] Invalid order object fetched. ID: ${orderId}, Reason:`, result.error.flatten());
            return null;
        }
    }

    return null;
}

// --- Server Container Component ---
// Responsibility: Fetch and sanitize data for a specific order.
export default async function OrderDetailPage({ params }: { params: { orderId: string }}) {
    const orderId = params.orderId;
    
    // 1. Fetch and sanitize data on the server.
    const order = await getAdminOrderById(orderId);

    if (!order) {
        notFound();
    }
    
    // Convert Date objects to strings before passing to client component
    const serializableOrder = {
        ...order,
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(0).toISOString(),
    };
    
    // 2. Pass the clean, serializable data to the Client Component for presentation.
    return <OrderDetailsClient initialOrder={serializableOrder as Order} />;
}
