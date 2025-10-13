
'use server';
/**
 * @fileOverview A Genkit flow to securely fetch all orders for the admin panel.
 * 
 * - getAllOrders - Fetches all orders from all users.
 * - OrderWithUserName - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { OrderWithUserName, Order } from '@/lib/types';
import { initializeApp, getApps, App, FirebaseApp } from 'firebase/app';
import { getFirestore, collectionGroup, query, orderBy, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Define the output schema for the flow
const GetAllOrdersOutputSchema = z.array(z.custom<OrderWithUserName>());

// --- Firebase Client SDK Initialization (within the server environment) ---
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);


// Main exported function that the client will call
export async function getAllOrders(): Promise<OrderWithUserName[]> {
  return getAllOrdersFlow();
}


const getAllOrdersFlow = ai.defineFlow(
  {
    name: 'getAllOrdersFlow',
    outputSchema: GetAllOrdersOutputSchema,
  },
  async () => {
    try {
      // Query the entire 'orders' collection group using the client SDK from a trusted server environment
      const ordersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
      const ordersSnap = await getDocs(ordersQuery);

      if (ordersSnap.empty) {
        console.log('Admin flow: No orders found in the database.');
        return [];
      }

      const fetchedOrders: OrderWithUserName[] = ordersSnap.docs.map(doc => {
        const orderData = doc.data() as Order;
        
        let createdAt: Date;
        if (orderData.createdAt && (orderData.createdAt as any).toDate) {
            createdAt = (orderData.createdAt as any).toDate();
        } else if (typeof orderData.createdAt === 'string') {
            createdAt = new Date(orderData.createdAt);
        } else {
            createdAt = new Date();
        }

        return {
          ...orderData,
          id: doc.id,
          createdAt: createdAt.toISOString(),
          userName: orderData.customerName || 'Invitado', // Use customer name from order
        };
      });
      
      return fetchedOrders;
      
    } catch (error) {
      console.error('CRITICAL: Genkit flow failed to fetch orders.', error);
      // This error will be propagated to the client and caught by the component.
      throw new Error('Failed to retrieve orders from the database due to a server-side error.');
    }
  }
);
