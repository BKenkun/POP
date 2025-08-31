
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe outside of the request handler
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product']
        });

        for (const item of lineItems.data) {
            const product = item.price?.product as Stripe.Product;
            const quantitySold = item.quantity || 0;
            
            if (product && product.metadata.stock) {
                const currentStock = parseInt(product.metadata.stock, 10);
                
                if (!isNaN(currentStock)) {
                    const newStock = Math.max(0, currentStock - quantitySold);
                    
                    await stripe.products.update(product.id, {
                        metadata: {
                            ...product.metadata,
                            stock: newStock.toString(),
                        },
                    });

                    console.log(`✅ Stock updated for product ${product.name} (${product.id}). New stock: ${newStock}`);
                }
            }
        }
    } catch (error: any) {
        console.error('Error updating product stock:', error);
        return NextResponse.json({ error: 'Internal server error while updating stock.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
