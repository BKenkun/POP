'use server';

import { z } from 'zod';
import { getUserIdFromSession } from './user-data';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// This is the unique ID for your subscription plan in your system.
// We will use this to find or create the corresponding plan on NOWPayments.
const INTERNAL_PLAN_ID = "mi_dosis_mensual_p_44_eur";

/**
 * Creates a subscription plan on NOWPayments if it doesn't exist.
 * Returns the plan ID from NOWPayments.
 */
async function getOrCreateSubscriptionPlan(): Promise<string> {
    if (!NOWPAYMENTS_API_KEY) {
        throw new Error('NOWPayments API key is not configured.');
    }

    try {
        // First, try to find an existing plan (NOWPayments API doesn't have a "get plan by title" endpoint, so we manage it internally)
        // For this implementation, we will assume we need to create it if we don't have a stored ID.
        // In a real-world, scalable app, you'd store the returned plan_id in a database.
        // For now, we will create it every time for simplicity, as NOWPayments handles duplicates gracefully by returning the existing one.
        
        const response = await fetch(`${NOWPAYMENTS_API_URL}/subscription/plan`, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Mi Dosis Mensual - P', // Title for the plan
                amount: 44, // Cost per period
                currency: 'EUR', // Currency
                interval_type: 'month', // Period duration
                interval_count: 1 // Number of intervals (e.g., 1 for every month)
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Check if the plan already exists, which NOWPayments might return as an error
            if (data.message && data.message.includes('already exist')) {
                 // This part is tricky as the API does not return the existing ID.
                 // A robust solution would require fetching all plans and filtering by title.
                 // For this case, we rely on the creation being idempotent or we manage IDs outside.
                 // We will proceed assuming creation is the main path.
                 throw new Error(`The subscription plan seems to exist but we cannot retrieve it. Details: ${data.message}`);
            }
            throw new Error(data.message || 'Error creating subscription plan on NOWPayments.');
        }
        
        if (!data.plan_id) {
            throw new Error('Failed to get plan_id from NOWPayments response.');
        }

        return data.plan_id;
    } catch (error: any) {
        console.error('Error in getOrCreateSubscriptionPlan:', error);
        throw error;
    }
}


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
        const planId = await getOrCreateSubscriptionPlan();
        
        const userEmailResponse = await getDoc(doc(db, 'users', userId));
        if (!userEmailResponse.exists()) {
             throw new Error('User not found.');
        }
        const userEmail = userEmailResponse.data()?.email;

        const response = await fetch(`${NOWPAYMENTS_API_URL}/subscription`, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_id: planId,
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
