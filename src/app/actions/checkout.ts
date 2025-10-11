
'use server';

import { db } from '@/lib/firebase-admin';
import { doc, setDoc, serverTimestamp } from 'firebase-admin/firestore';
import type { Order } from '@/lib/types';
import { z } from 'zod';
import { OrderSchema } from '@/lib/types';

// Define a schema for the incoming payload to ensure type safety
const OrderPayloadSchema = OrderSchema.omit({ id: true, createdAt: true });

/**
 * Server Action to create a reservation for a guest user.
 * This function runs on the server and has administrative privileges to write to Firestore.
 * @param orderId The pre-generated ID for the order.
 * @param orderPayload The data for the order, validated against the schema.
 * @returns An object indicating success or failure.
 */
export async function createGuestReservation(orderId: string, orderPayload: Omit<Order, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
  // Validate the payload received from the client
  const validation = OrderPayloadSchema.safeParse(orderPayload);

  if (!validation.success) {
    console.error('Invalid order payload received in server action:', validation.error);
    return { success: false, error: 'Los datos del pedido son inválidos.' };
  }

  if (validation.data.userId !== 'guest') {
    return { success: false, error: 'Esta función es solo para reservas de invitados.' };
  }
  
  try {
    const reservationRef = doc(db, 'reservations', orderId);
    
    // Create the final object to save, including the server-side timestamp
    const reservationData = {
      ...validation.data,
      createdAt: serverTimestamp(),
    };

    await setDoc(reservationRef, reservationData);
    
    console.log(`✅ Guest reservation ${orderId} created successfully via Server Action.`);
    return { success: true };

  } catch (error: any) {
    console.error(`❌ Failed to create guest reservation ${orderId} via Server Action:`, error);
    return { success: false, error: error.message || 'No se pudo guardar la reserva en la base de datos.' };
  }
}

    