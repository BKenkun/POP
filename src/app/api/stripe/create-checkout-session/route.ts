
import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { CartItem } from '@/lib/types';
import { auth as adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Ensure the secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
        const { cartItems, customerEmail } = await req.json();

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart items are required.' }, { status: 400 });
        }
        
        const userId = await getUserIdFromSession();

        const line_items = cartItems.map((item: CartItem) => {
            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                        images: [item.imageUrl],
                        description: item.description || undefined,
                        // Store our product ID in Stripe's metadata
                        metadata: {
                            productId: item.id
                        }
                    },
                    unit_amount: item.price, // Price in cents
                },
                quantity: item.quantity,
            };
        });
        
        const YOUR_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/checkout`,
            customer_email: customerEmail,
            // Pass the user ID to the session metadata so we can associate the order with the user later
            metadata: {
                userId: userId || 'guest',
            }
        });

        return NextResponse.json({ checkoutUrl: session.url });

    } catch (error: any) {
        console.error('Error creating Stripe checkout session:', error);
        return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
    }
}
