
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20',
});

export async function createStripePortalAction(userId: string): Promise<{ url?: string; error?: string }> {
    if (!userId) {
        return { error: "User not found." };
    }

    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return { error: 'User data not found in database.' };
        }

        const stripeCustomerId = userDoc.data()?.stripeCustomerId;

        if (!stripeCustomerId) {
            return { error: 'Stripe customer ID not found for this user.' };
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`,
        });

        return { url: portalSession.url };

    } catch (error: any) {
        console.error('Error creating Stripe portal session:', error);
        return { error: 'Could not create management session. Please contact support.' };
    }
}
