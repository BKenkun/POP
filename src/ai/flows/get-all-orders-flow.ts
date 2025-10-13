
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
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

// Define the output schema for the flow
const GetAllOrdersOutputSchema = z.array(z.custom<OrderWithUserName>());

// --- Firebase Admin Initialization ---
// This ensures we have a single, memoized instance of the Firebase Admin app.
const getFirebaseAdminApp = (): App => {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    // Attempt to initialize with default credentials if the env var is not set.
    // This works in environments like Google Cloud Run, Firebase Hosting, etc.
    try {
        return admin.initializeApp();
    } catch(e) {
        console.error("Admin SDK initialization failed. Either set FIREBASE_SERVICE_ACCOUNT_KEY or run in a GCP/Firebase environment.");
        throw new Error("Firebase server configuration is invalid. Check environment variables.");
    }
  }

  try {
    const credentials = JSON.parse(serviceAccountKey);
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  } catch (error) {
    console.error('Error parsing Firebase service account key:', error);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
};


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
    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    try {
      // Query the entire 'orders' collection group
      const ordersQuery = db.collectionGroup('orders').orderBy('createdAt', 'desc');
      const ordersSnap = await ordersQuery.get();

      if (ordersSnap.empty) {
        console.log('Admin flow: No orders found in the database.');
        return [];
      }

      const fetchedOrders: OrderWithUserName[] = ordersSnap.docs.map(doc => {
        const orderData = doc.data() as Order;
        const createdAt = (orderData.createdAt as any)?.toDate ? (orderData.createdAt as any).toDate() : new Date();

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
      throw new Error('Failed to retrieve orders from the database due to a server-side error.');
    }
  }
);
