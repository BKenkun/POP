
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
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
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
      // 1. Get all users
      const usersQuery = query(collection(db, 'users'));
      const usersSnap = await getDocs(usersQuery);
      
      if (usersSnap.empty) {
        console.log('Admin flow: No users found.');
        return [];
      }

      const allOrders: OrderWithUserName[] = [];
      
      // 2. For each user, get their orders
      for (const userDoc of usersSnap.docs) {
          const userId = userDoc.id;
          const userData = userDoc.data();
          const userName = userData.displayName || userData.email || 'Invitado';

          const ordersQuery = query(collection(db, 'users', userId, 'orders'), orderBy('createdAt', 'desc'));
          const ordersSnap = await getDocs(ordersQuery);

          ordersSnap.forEach(orderDoc => {
              const orderData = orderDoc.data() as Order;

              let createdAt: Date;
              if (orderData.createdAt && (orderData.createdAt as any).toDate) {
                  createdAt = (orderData.createdAt as any).toDate();
              } else if (typeof orderData.createdAt === 'string') {
                  createdAt = new Date(orderData.createdAt);
              } else {
                  createdAt = new Date();
              }

              allOrders.push({
                  ...orderData,
                  id: orderDoc.id,
                  createdAt: createdAt.toISOString(),
                  userName: orderData.customerName || userName, // Prefer customer name from order
              });
          });
      }

      // Sort all orders globally by date
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allOrders;
      
    } catch (error) {
      console.error('CRITICAL: Genkit flow failed to fetch orders.', error);
      // This error will be propagated to the client and caught by the component.
      throw new Error('Failed to retrieve orders from the database due to a server-side error.');
    }
  }
);
