
'use server';

import { z } from 'zod';
import { getUserIdFromSession } from './user-data';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// This is the unique ID for your subscription plan in your system.
const SUBSCRIPTION_PLAN_ID = "1237708102";


/**
 * Creates a new subscription for a user and returns the invoice URL to start the payment process.
 */
export async function createNowPaymentsSubscription(): Promise<{ success: boolean; invoice_url?: string; error?: string }> {
    if (!NOWPAYMENTS_API_KEY || !BASE_URL) {
        console.error('NOWPayments API key or Base URL is not set.');
        return {
            success: false,
            error: 'El servicio de suscripciones no está configurado correctamente.',
        };
    }

    try {
        const userId = await getUserIdFromSession();
        
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
             throw new Error('User not found.');
        }
        const userEmail = userDocSnap.data()?.email;

        const response = await fetch(`${NOWPAYMENTS_API_URL}/subscription`, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_id: SUBSCRIPTION_PLAN_ID,
                order_id: `sub_${userId}_${Date.now()}`,
                order_description: 'Suscripción a Mi Dosis Mensual',
                // We pass the user's email to associate the subscription with them in NOWPayments
                email: userEmail, 
                // Redirect URLs
                success_url: `${BASE_URL}/subscription/success`,
                cancel_url: `${BASE_URL}/subscription/failed`,
                // Webhook for server-to-server notifications
                ipn_callback_url: `${BASE_URL}/api/nowpayments/subscription-webhook`,
            }),
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error creating the subscription.');
        }
        
        if (!data.invoice_url) {
            throw new Error('NOWPayments did not return a valid invoice URL.');
        }

        return { success: true, invoice_url: data.invoice_url };

    } catch (error: any) {
        console.error('Error creating NOWPayments subscription:', error);
        return { success: false, error: error.message };
    }
}
