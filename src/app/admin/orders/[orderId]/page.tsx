import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase-admin/firestore';
import { Order, OrderSchema } from '@/lib/types';
import OrderDetailsClient from './order-details-client';
import { notFound } from 'next/navigation';

function processFirestoreData(data: { [key: string]: any }): any {
  const processedData: { [key: string]: any } = {};
  for (const key in data) {
    const value = data[key];
    if (value instanceof Timestamp) {
      processedData[key] = value.toDate();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      processedData[key] = processFirestoreData(value);
    } else {
      processedData[key] = value;
    }
  }
  return processedData;
}

async function getAdminOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) return null;

    try {
        const orderRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(orderRef);
        
        if (!docSnap.exists()) {
            return null;
        }
        
        const orderRaw = docSnap.data();
        const path = docSnap.ref.path;
        const processedData = processFirestoreData(orderRaw);
        
        const sanitizedOrder = {
            ...processedData,
            id: docSnap.id,
            path: path,
        };

        const result = OrderSchema.safeParse(sanitizedOrder);
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
    
    const serializableOrder = {
        ...order,
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(0).toISOString(),
    };
    
    return <OrderDetailsClient initialOrder={serializableOrder as Order} />;
}
