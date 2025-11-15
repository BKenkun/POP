import { NextRequest, NextResponse } from 'next/server';
import { CartItem } from '@/lib/types';
import { auth as adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

const INTERMEDIARY_API_URL = 'https://studio--studio-953389996-b1a64.us-central1.hosted.app/api/purchase';

async function getUserIdFromSession() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedClaims.uid;
    } catch (error) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { cartItems } = await req.json();

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart items are required.' }, { status: 400 });
        }
        
        const userId = await getUserIdFromSession();

        const productName = cartItems.length > 1 
            ? `${cartItems[0].name} y ${cartItems.length - 1} más` 
            : cartItems[0].name;
            
        const priceInCents = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const YOUR_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const purchaseDetails = {
            productName,
            priceInCents,
            successUrl: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${YOUR_DOMAIN}/products`,
            metadata: {
                userId: userId || 'guest',
                // Storing cartItems as a string, as metadata values are limited.
                cartItems: JSON.stringify(cartItems.map(item => ({ id: item.id, qty: item.quantity })))
            }
        };

        const intermediaryResponse = await fetch(INTERMEDIARY_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseDetails),
        });

        if (!intermediaryResponse.ok) {
            const errorData = await intermediaryResponse.json();
            throw new Error(errorData.error || 'The payment gateway is not available.');
        }

        const { checkoutUrl } = await intermediaryResponse.json();
        
        return NextResponse.json({ checkoutUrl });

    } catch (error: any) {
        console.error('Error creating checkout session via intermediary:', error);
        return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
    }
}
