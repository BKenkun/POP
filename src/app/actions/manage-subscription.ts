
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getUserIdFromSession } from './user-data';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

// Función para obtener el token JWT de NOWPayments
async function getNowPaymentsJwt(): Promise<string> {
    const email = process.env.NOWPAYMENTS_EMAIL;
    const password = process.env.NOWPAYMENTS_PASSWORD;

    if (!email || !password) {
        throw new Error('Las credenciales de NOWPayments no están configuradas en el servidor.');
    }

    const response = await fetch(`${NOWPAYMENTS_API_URL}/auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await response.json();
    if (!response.ok || !data.token) {
        throw new Error('No se pudo obtener el token de autorización de NOWPayments.');
    }
    return data.token;
}

export async function cancelNowPaymentsSubscription(): Promise<{ success: boolean; message: string }> {
    if (!NOWPAYMENTS_API_KEY) {
        console.error('NOWPayments API key is not set.');
        return { success: false, message: 'El servicio de suscripciones no está configurado.' };
    }

    try {
        const userId = await getUserIdFromSession();

        // 1. Obtener los datos de la suscripción del usuario desde Firestore
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        // Safely access nested property
        const subscriptionId = userDocSnap.data()?.subscription?.sub_id;

        if (!userDocSnap.exists() || !subscriptionId) {
            return { success: false, message: 'No se encontró una suscripción activa para este usuario.' };
        }
        
        // 2. Obtener el token JWT para autorizar la cancelación
        const jwtToken = await getNowPaymentsJwt();

        // 3. Realizar la llamada a la API de NOWPayments para cancelar
        const response = await fetch(`${NOWPAYMENTS_API_URL}/subscriptions/${subscriptionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
        });

        const responseData = await response.json();

        if (!response.ok || responseData.result !== 'ok') {
            // Log the actual error from NOWPayments for better debugging
            console.error('NOWPayments cancellation error:', responseData);
            throw new Error(responseData.message || 'Error al cancelar la suscripción en NOWPayments.');
        }

        // 4. Actualizar el estado de la suscripción en Firestore
        await updateDoc(userDocRef, {
            'subscription.status': 'cancelled',
            'isSubscribed': false,
        });

        return { success: true, message: 'Tu suscripción ha sido cancelada con éxito.' };

    } catch (error: any) {
        console.error('Error canceling NOWPayments subscription:', error);
        return { success: false, message: error.message || 'No se pudo cancelar la suscripción.' };
    }
}
