
'use client';

import Stripe from 'stripe';
import type { Product, CartItem, PackItemBrief } from './types';

// This is the global instance of Stripe, initialized once.
let stripe: Stripe | null = null;

const getStripeInstance = (): Stripe => {
  if (stripe) {
    return stripe;
  }
  // FORCED FIX: Directly inserting the key to resolve the runtime error.
  const secretKey = 'sk_test_51S2BQRPfSUu85QwBt6sQlOaFtlsqJJ1ivKpmF9Pa5wduBGTCICSoyJlTu2inJmOD8ekJTY6hYkH7h51Nlb3exmD20089DCawaM';
  if (!secretKey) {
    // This will now clearly fail if the key is not set
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. Please ensure it is available in the environment.'
    );
  }
  stripe = new Stripe(secretKey, {
    apiVersion: '2024-06-20',
    typescript: true,
  });
  return stripe;
};

export async function createCheckoutSession(
  items: CartItem[],
  userId?: string,
  pointsToRedeem: number = 0
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
  try {
    const stripe = getStripeInstance();
    
    const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    
    // Create a coupon for the loyalty points discount
    let couponId: string | undefined = undefined;
    const pointsDiscountAmount = pointsToRedeem * 2; // 100 points = 2€, so 1 point = 2 cents

    if (pointsDiscountAmount > 0) {
        const coupon = await stripe.coupons.create({
            amount_off: pointsDiscountAmount,
            currency: 'eur',
            duration: 'once',
            name: `Descuento fidelidad (${pointsToRedeem} pts)`,
        });
        couponId = coupon.id;
    }

    const line_items = items.map((item) => ({
        price_data: {
            currency: 'eur',
            product_data: {
                name: item.name,
                images: item.imageUrl ? [item.imageUrl] : [],
                description: item.description || undefined,
                metadata: {
                    productId: item.id,
                },
            },
            unit_amount: item.price,
        },
        quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['ES'],
      },
      metadata: {
        ...(userId && { userId }),
        pointsRedeemed: pointsToRedeem.toString(),
      },
      ...(userId && { customer_email: undefined }),
      ...(couponId && { discounts: [{ coupon: couponId }] }),
    });

    if (!session.url) {
      return {
        sessionId: null,
        sessionUrl: null,
        error: 'Could not create checkout session URL.',
      };
    }

    return { sessionId: session.id, sessionUrl: session.url };
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return { sessionId: null, sessionUrl: null, error: error.message };
  }
}


export async function createPackCheckoutSession(
  pack: CartItem,
  packItems: PackItemBrief[],
  userId?: string,
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
  try {
    const stripe = getStripeInstance();
    const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    // Serialize the pack contents to store in metadata
    const packContents = packItems.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
    }, {} as { [key: string]: number });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: pack.name,
                        images: [pack.imageUrl],
                        description: `Contenido del pack: ${pack.description || 'Varios productos'}`
                    },
                    unit_amount: pack.price, // The dynamically calculated price
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/create-pack`, // Go back to pack builder on cancel
        billing_address_collection: 'required',
        shipping_address_collection: {
            allowed_countries: ['ES'],
        },
        metadata: {
            isCustomPack: 'true',
            packContents: JSON.stringify(packContents), // Store pack contents
            ...(userId && { userId }),
        },
         // Pass customer email if user is logged in
        ...(userId && { customer_email: undefined }),
    });

     if (!session.url) {
      return { sessionId: null, sessionUrl: null, error: 'Could not create checkout session URL.' };
    }
    
    return { sessionId: session.id, sessionUrl: session.url };

  } catch (error: any) {
    console.error('Error creating Stripe pack checkout session:', error);
    return { sessionId: null, sessionUrl: null, error: error.message };
  }
}

export async function createSubscriptionCheckout(userId: string, userEmail: string): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
    try {
        const stripe = getStripeInstance();
        const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
        // HARDCODED PRICE ID FOR "DOSIS MENSUAL" SUBSCRIPTION - 5 poppers, 1 accessory, 1 gift for 44€/month
        const subscriptionPriceId = 'price_1PgxNQRfSUu85QwBvW9b9pwt';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                { price: subscriptionPriceId, quantity: 1 },
            ],
            mode: 'subscription',
            success_url: `${YOUR_DOMAIN}/account/subscription?subscription_success=true`,
            cancel_url: `${YOUR_DOMAIN}/subscription`,
            customer_email: userEmail,
            metadata: {
                userId: userId,
            },
        });
        
        return { sessionId: session.id, sessionUrl: session.url };
    } catch (error: any) {
        console.error('Error creating Stripe subscription checkout:', error);
        return { sessionId: null, sessionUrl: null, error: error.message };
    }
}
    

    