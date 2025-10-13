
'use server';
/**
 * @fileOverview A Genkit flow to securely fetch all customer orders for the admin panel.
 *
 * - getAllOrders - A server-side function that queries the entire 'orders' collection group.
 * - OrderWithUserName - The combined type for the order and the user's display name.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { UserRecord } from 'firebase-admin/auth';
import {getAuth} from "firebase-admin/auth";
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { Order } from '@/lib/types';


// Define the output schema for a single order, including the user's name
const OrderWithUserNameSchema = z.object({
  id: z.string(),
  createdAt: z.string(), // Pass as ISO string
  status: z.string(),
  total: z.number(),
  userName: z.string(),
  // Include other relevant fields from your Order type if needed
});

// Define the output for the entire flow, which is an array of orders
const GetAllOrdersOutputSchema = z.array(OrderWithUserNameSchema);
export type OrderWithUserName = z.infer<typeof OrderWithUserNameSchema>;

// Helper to initialize Firebase Admin SDK reliably
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  // This initialization will only run once
  return initializeApp();
}

export async function getAllOrders(): Promise<OrderWithUserName[]> {
  return getAllOrdersFlow();
}

const getAllOrdersFlow = ai.defineFlow(
  {
    name: 'getAllOrdersFlow',
    inputSchema: z.void(),
    outputSchema: GetAllOrdersOutputSchema,
  },
  async () => {
    console.log('Admin flow started: Fetching all orders...');
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);
    const auth = getAuth(adminApp);

    // 1. Get all users to map user ID to user name
    const allUsers: Record<string, string> = {};
    const listUsersResult = await auth.listUsers();
    listUsersResult.users.forEach((userRecord: UserRecord) => {
      allUsers[userRecord.uid] = userRecord.displayName || userRecord.email || 'Usuario Desconocido';
    });
    
    // 2. Query the entire 'orders' collection group
    const ordersQuery = db.collectionGroup('orders').orderBy('createdAt', 'desc');
    const ordersSnap = await ordersQuery.get();

    if (ordersSnap.empty) {
      console.log('Admin flow: No orders found in the database.');
      return [];
    }

    // 3. Map orders and add user names
    const orders: OrderWithUserName[] = ordersSnap.docs.map(doc => {
      const orderData = doc.data() as Order;
      const createdAt = (orderData.createdAt as any)?.toDate ? (orderData.createdAt as any).toDate() : new Date();
      
      return {
        id: doc.id,
        createdAt: createdAt.toISOString(), // Convert to ISO string for serialization
        status: orderData.status,
        total: orderData.total,
        userName: allUsers[orderData.userId] || orderData.customerName || 'Invitado',
      };
    });
    
    console.log(`Admin flow finished: Found ${orders.length} orders.`);
    return orders;
  }
);
