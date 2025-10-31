
'use server';

// This file is being refactored to remove server-side data fetching
// that conflicts with the client-side authentication model.
// Data fetching for the admin panel will be handled directly in the client components
// using onSnapshot, secured by Firestore rules.

import { auth, firestore } from '@/lib/firebase-admin';
import type { Order, Customer } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

/**
 * This file's functions are being deprecated in favor of client-side data fetching
 * for the admin panel to resolve authentication conflicts.
 */

export async function getAllOrders(): Promise<Order[]> {
    console.warn("DEPRECATED: getAllOrders is no longer used. Data is fetched on the client.");
    return [];
}

export async function getAllCustomers(): Promise<Customer[]> {
     console.warn("DEPRECATED: getAllCustomers is no longer used. Data is fetched on the client.");
    return [];
}

export async function getOrderById(orderId: string, orderPath: string): Promise<Order | null> {
    console.warn("DEPRECATED: getOrderById is no longer used. Data is fetched on the client.");
    return null;
}
