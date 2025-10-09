
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createOrder, updateUserLoyaltyPoints } from '@/lib/orders';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function updateStock(productId: string, quantitySold: number) {
    try {
        const product = await stripe.products.retrieve(productId);
        if (product && product.metadata.stock) {
            const currentStock = parseInt(product.metadata.stock, 10);
            if (!isNaN(currentStock)) {
                const newStock = Math.max(0, currentStock - quantitySold);
                await stripe.products.update(productId, {
                    metadata: { ...product.metadata, stock: newStock.toString() },
                });
                console.log(`✅ Stock updated for product ${product.name} (${productId}). New stock: ${newStock}`);
            }
        }
    } catch (error) {
        console.error(`❌ Failed to update stock for product ${productId}:`, error);
    }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === 'payment') {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product']
        });
        
        await createOrder(session, lineItems.data);

        const userId = session.metadata?.userId;
        const totalSpent = session.amount_total || 0;
        const pointsRedeemed = parseInt(session.metadata?.pointsRedeemed || '0', 10);

        if (userId) {
            if (pointsRedeemed > 0) {
                await updateUserLoyaltyPoints(userId, -pointsRedeemed);
            }
            if (totalSpent > 0) {
                const pointsEarned = Math.floor(totalSpent / 100);
                await updateUserLoyaltyPoints(userId, pointsEarned);
            }
        }

        const isCustomPack = session.metadata?.isCustomPack === 'true';

        if (isCustomPack) {
            const packContents = JSON.parse(session.metadata?.packContents || '{}');
            for (const productId in packContents) {
                const quantitySold = packContents[productId];
                await updateStock(productId, quantitySold);
            }
        } else {
            for (const item of lineItems.data) {
                const product = item.price?.product as Stripe.Product;
                const productId = product.id; 
                const quantitySold = item.quantity || 0;
                
                if (productId && quantitySold > 0) {
                    await updateStock(productId, quantitySold);
                }
            }
        }
      } catch (error: any) {
        console.error('Error processing checkout.session.completed (payment):', error);
        return NextResponse.json({ error: `Webhook handler failed: ${error.message}` }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
