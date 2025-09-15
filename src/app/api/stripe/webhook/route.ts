
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createOrder } from '@/lib/orders';

// Initialize Stripe outside of the request handler
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to update stock for a single product
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
        // We don't re-throw here to allow other stock updates to proceed
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

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product']
        });
        
        // This is where you would fulfill the order:
        // - Save order details to your database (e.g., Firestore)
        // - Send a confirmation email
        // - Update product stock
        
        // Step 1: Create the order in Firestore.
        // This function will throw an error if it fails, which will be caught below.
        await createOrder(session, lineItems.data);


        // Step 2: Update stock levels
        const isCustomPack = session.metadata?.isCustomPack === 'true';

        if (isCustomPack) {
            // Logic for custom packs
            const packContents = JSON.parse(session.metadata?.packContents || '{}');
            for (const productId in packContents) {
                const quantitySold = packContents[productId];
                await updateStock(productId, quantitySold);
            }
        } else {
            // Logic for regular products
            for (const item of lineItems.data) {
                const product = item.price?.product as Stripe.Product;
                // The actual product ID is stored in the product's metadata by our checkout function
                const productId = product.metadata.productId; 
                const quantitySold = item.quantity || 0;
                
                if (productId && quantitySold > 0) {
                    await updateStock(productId, quantitySold);
                }
            }
        }
    } catch (error: any) {
        console.error('Error processing checkout session:', error);
        // If order creation or stock update fails, return an error.
        // Stripe will automatically retry the webhook.
        return NextResponse.json({ error: `Webhook handler failed: ${error.message}` }, { status: 500 });
    }
  }

  // Acknowledge receipt of the event
  return NextResponse.json({ received: true });
}

