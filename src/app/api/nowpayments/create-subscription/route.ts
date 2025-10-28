
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth as adminAuth, firestore as db } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

// This is the unique ID for your subscription plan in your system.
const SUBSCRIPTION_PLAN_ID = "1237708102";

async function getUserIdFromSession(): Promise<string> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        throw new Error('Authentication required: No session cookie found.');
    }
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedClaims.uid;
    } catch (error) {
        console.error('Error verifying session cookie in API route:', error);
        throw new Error('Authentication failed: Invalid session.');
    }
}


export async function POST(req: NextRequest) {
    if (!NOWPAYMENTS_API_KEY) {
        console.error('NOWPayments API key or Base URL is not set.');
        return NextResponse.json({
            success: false,
            error: 'El servicio de suscripciones no está configurado correctamente.',
        }, { status: 500 });
    }

    try {
        const userId = await getUserIdFromSession();
        
        // Firestore Admin SDK cannot be used here, we need to use the client SDK with the user's credentials
        // But since this is a server route, we can't easily get the client auth object.
        // Let's get the user email from the admin SDK using the UID.
        const userRecord = await adminAuth.getUser(userId);
        const userEmail = userRecord.email;

        if (!userEmail) {
            throw new Error('User email not found.');
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
        
        const invoiceUrl = data.result?.[0]?.invoice_url;

        if (!invoiceUrl) {
            console.error('NOWPayments did not return a valid invoice URL. Response:', data);
            throw new Error('NOWPayments did not return a valid invoice URL.');
        }

        return NextResponse.json({ success: true, invoice_url: invoiceUrl });

    } catch (error: any) {
        console.error('Error creating NOWPayments subscription:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
