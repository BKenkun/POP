
'use server';

import { auth as adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

// This is the unique ID for your subscription plan in your system.
const SUBSCRIPTION_PLAN_ID = "1441433881";

async function getAuthenticatedUserFromSession(): Promise<{ uid: string; email: string | undefined }> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        throw new Error('Authentication required: No session cookie found.');
    }
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        return { uid: decodedClaims.uid, email: decodedClaims.email };
    } catch (error) {
        console.error('Error verifying session cookie in server action:', error);
        throw new Error('Authentication failed: Invalid session.');
    }
}


export async function createNowPaymentsSubscription(): Promise<{ success: boolean; invoice_url?: string; error?: string }> {
    if (!NOWPAYMENTS_API_KEY) {
        console.error('NOWPayments API key is not set.');
        return {
            success: false,
            error: 'El servicio de suscripciones no está configurado correctamente.',
        };
    }

    try {
        const { email: userEmail } = await getAuthenticatedUserFromSession();

        if (!userEmail) {
            throw new Error('User email not found in session.');
        }

        const response = await fetch(`${NOWPAYMENTS_API_URL}/subscription-payments`, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_id: SUBSCRIPTION_PLAN_ID,
                email: userEmail,
            }),
        });
        
        const data = await response.json();

        if (!response.ok) {
            console.error('NOWPayments API Error:', data);
            throw new Error(data.message || 'Error creating the subscription.');
        }
        
        // According to NOWPayments docs for subscriptions, the response is an array.
        const invoiceUrl = data.result?.[0]?.invoice_url;

        if (!invoiceUrl) {
            console.error('NOWPayments did not return a valid invoice URL. Response:', data);
            throw new Error('NOWPayments did not return a valid invoice URL.');
        }

        return { success: true, invoice_url: invoiceUrl };

    } catch (error: any) {
        console.error('Error creating NOWPayments subscription:', error);
        return { success: false, error: error.message };
    }
}
