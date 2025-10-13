
'use server';
/**
 * @fileOverview A Genkit flow to retrieve all orders from all users.
 * This flow is intended to be called only by an authenticated admin.
 *
 * - getAllOrders - Fetches all orders from all users in Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { OrderWithUserName } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';

// Define output schema for Zod validation
const OrderWithUserNameSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  status: z.string(),
  total: z.number(),
  userName: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
});

const AllOrdersOutputSchema = z.array(OrderWithUserNameSchema);
export type AllOrdersOutput = z.infer<typeof AllOrdersOutputSchema>;

// Initialize a client-side Firebase app instance within the server environment.
// This is a workaround for environments where the Admin SDK fails to authenticate.
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const db = getFirestore(app);

export async function getAllOrders(): Promise<AllOrdersOutput> {
  return getAllOrdersFlow();
}

const getAllOrdersFlow = ai.defineFlow(
  {
    name: 'getAllOrdersFlow',
    inputSchema: z.void(),
    outputSchema: AllOrdersOutputSchema,
  },
  async () => {
    console.log('Admin flow: Starting to fetch all orders.');
    try {
      // 1. Get all users to map user ID to user name
      const usersQuery = query(collection(db, 'users'));
      const usersSnap = await getDocs(usersQuery);
      const allUsers: Record<string, string> = {};

      if (usersSnap.empty) {
        console.warn('Admin flow: No user documents found.');
      } else {
         usersSnap.forEach(userDoc => {
            const userData = userDoc.data();
            allUsers[userDoc.id] = userData.displayName || userData.email || 'Usuario Desconocido';
        });
      }

      // 2. Iterate through users to get their orders
      const fetchedOrders: OrderWithUserName[] = [];
      for (const userId in allUsers) {
        const ordersQuery = query(
          collection(db, 'users', userId, 'orders'),
          orderBy('createdAt', 'desc')
        );
        const ordersSnap = await getDocs(ordersQuery);

        ordersSnap.forEach(orderDoc => {
          const orderData = orderDoc.data();
          
          let createdAt: Date;
          if (orderData.createdAt instanceof Timestamp) {
            createdAt = orderData.createdAt.toDate();
          } else if (typeof orderData.createdAt === 'string') {
            createdAt = new Date(orderData.createdAt);
          } else {
            createdAt = new Date(); // Fallback
          }

          fetchedOrders.push({
            id: orderDoc.id,
            createdAt: createdAt.toISOString(),
            status: orderData.status || 'desconocido',
            total: orderData.total || 0,
            userName: orderData.customerName || allUsers[userId]!,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail
          });
        });
      }

      // Sort all collected orders by date
      fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log(`Admin flow: Successfully fetched ${fetchedOrders.length} orders.`);
      return fetchedOrders;
    } catch (error) {
      console.error('CRITICAL: Genkit flow failed to fetch orders.', error);
      // This error will be propagated to the client and caught by the component.
      throw new Error('Failed to retrieve orders from the database due to a server-side error.');
    }
  }
);
