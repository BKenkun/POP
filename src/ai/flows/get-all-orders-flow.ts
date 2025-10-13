
'use server';
/**
 * @fileOverview A Genkit flow to securely fetch all orders for the admin panel.
 *
 * - getAllOrders - A function that fetches all orders from all user subcollections.
 * - AdminOrder - The simplified return type for orders in the admin view.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { firebaseConfig } from '@/firebase/config';

// Define the output schema for an individual order for the admin panel
const AdminOrderSchema = z.object({
  id: z.string(),
  createdAt: z.string(), // Use string for dates to ensure serializability
  status: z.string(),
  total: z.number(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  userId: z.string(),
});

export type AdminOrder = z.infer<typeof AdminOrderSchema>;

// Define the output schema for the entire flow
const GetAllOrdersOutputSchema = z.array(AdminOrderSchema);

let adminApp: App;
let db: Firestore;
let auth: ReturnType<typeof getAuth>;

// This function initializes the Firebase Admin SDK if it hasn't been already.
// It's designed to be safely called within the Genkit flow environment.
function initializeAdmin() {
  if (!getApps().some(app => app.name === 'admin')) {
      adminApp = initializeApp({
          // Using projectId from config, as service account credentials should be
          // automatically available in the Google Cloud environment.
          projectId: firebaseConfig.projectId,
      }, 'admin');
  } else {
      adminApp = getApps().find(app => app.name === 'admin')!;
  }
  db = getFirestore(adminApp);
  auth = getAuth(adminApp);
}


/**
 * A Genkit flow that securely fetches all orders from all users.
 * This flow is intended to be called only from the admin panel.
 */
export const getAllOrdersFlow = ai.defineFlow(
  {
    name: 'getAllOrdersFlow',
    inputSchema: z.void(),
    outputSchema: GetAllOrdersOutputSchema,
  },
  async () => {
    try {
      initializeAdmin(); // Ensure admin SDK is ready

      console.log('Admin flow: Fetching all orders...');

      // This is the most robust way to get all orders across all subcollections
      const ordersQuery = db.collectionGroup('orders').orderBy('createdAt', 'desc');
      const ordersSnap = await ordersQuery.get();

      if (ordersSnap.empty) {
        console.log('Admin flow: No orders found in the database.');
        return [];
      }

      // Map the documents to the defined Zod schema for type safety
      const allOrders: AdminOrder[] = ordersSnap.docs.map(doc => {
        const data = doc.data();
        
        let createdAt: Date;
        if (data.createdAt instanceof Timestamp) {
            createdAt = data.createdAt.toDate();
        } else if (typeof data.createdAt === 'string') {
            createdAt = new Date(data.createdAt);
        } else {
            // Fallback for unexpected formats
            createdAt = new Date();
        }

        return {
          id: doc.id,
          createdAt: createdAt.toISOString(), // Standardize to ISO string
          status: data.status || 'Estado Desconocido',
          total: data.total || 0,
          customerName: data.customerName || 'Cliente Desconocido',
          customerEmail: data.customerEmail || 'no-email@proporcionado.com',
          userId: data.userId || 'guest',
        };
      });

      console.log(`Admin flow: Successfully fetched ${allOrders.length} orders.`);
      return allOrders;

    } catch (error) {
      console.error('CRITICAL: Genkit flow failed to fetch orders.', error);
      // This error will be propagated to the client and caught by the component.
      throw new Error('Failed to retrieve orders from the database due to a server-side error.');
    }
  }
);


export async function getAllOrders(): Promise<AdminOrder[]> {
    return await getAllOrdersFlow();
}
