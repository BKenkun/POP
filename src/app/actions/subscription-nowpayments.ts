
'use server';

import { getUserIdFromSession } from './user-data';
import { cookies } from 'next/headers';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

// This is the unique ID for your subscription plan in your system.
const SUBSCRIPTION_PLAN_ID = "1441433881";

// This new server action receives the email directly from the client.
export async function createNowPaymentsSubscription(
    userEmail: string
): Promise<{ success: boolean; invoice_url?: string; error?: string }> {
    if (!NOWPAYMENTS_API_KEY) {
        console.error('NOWPayments API key is not set.');
        return {
            success: false,
            error: 'El servicio de suscripciones no está configurado correctamente.',
        };
    }

    try {
        // We still check for a valid session on the server as a security measure.
        await getUserIdFromSession();

        if (!userEmail) {
            throw new Error('El email del usuario es requerido para la suscripción.');
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
            throw new Error(data.message || 'Error al crear la suscripción.');
        }
        
        const invoiceUrl = data.result?.[0]?.invoice_url;

        if (!invoiceUrl) {
            console.error('NOWPayments no devolvió una URL de factura válida. Respuesta:', data);
            throw new Error('NOWPayments no devolvió una URL de factura válida.');
        }

        return { success: true, invoice_url: invoiceUrl };

    } catch (error: any) {
        console.error('Error creando la suscripción de NOWPayments:', error);
        return { success: false, error: error.message };
    }
}
