
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createOrder, updateUserLoyaltyPoints } from '@/lib/orders';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';


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

// Helper function to send Back in Stock event to Klaviyo
async function triggerKlaviyoBackInStock(email: string, product: Stripe.Product) {
    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
    if (!KLAVIYO_API_KEY) {
        console.warn("Klaviyo API Key is not set. Skipping back in stock notification.");
        return;
    }

    const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const productUrl = `${YOUR_DOMAIN}/product/${product.id}`;

    const payload = {
        data: {
            type: "event",
            attributes: {
                profile: {
                    email: email
                },
                metric: {
                    name: "Back in Stock"
                },
                properties: {
                    product_id: product.id,
                    product_name: product.name,
                    product_url: productUrl,
                    product_image_url: product.images?.[0] || '',
                },
                // Set a unique ID to prevent duplicate events for the same restock notification
                unique_id: `${product.id}-${email}-${new Date().toISOString().split('T')[0]}`
            }
        }
    };

    try {
        const response = await fetch('https://a.klaviyo.com/api/track', {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'accept': 'application/json',
                'content-type': 'application/json',
                'revision': '2024-02-15',
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 202) {
            console.log(`✅ Successfully sent 'Back in Stock' event to Klaviyo for ${email} and product ${product.name}.`);
        } else {
            const errorData = await response.json();
            console.error(`❌ Klaviyo API Error for Back in Stock event:`, JSON.stringify(errorData, null, 2));
        }
    } catch (error) {
        console.error("❌ Failed to send event to Klaviyo:", error);
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

  // --- Handle checkout.session.completed event ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product']
        });
        
        // Step 1: Create the order in Firestore.
        await createOrder(session, lineItems.data);

        // Step 2: Handle loyalty points
        const userId = session.metadata?.userId;
        const totalSpent = session.amount_total || 0; // Total in cents
        const pointsRedeemed = parseInt(session.metadata?.pointsRedeemed || '0', 10);

        if (userId) {
            // Subtract redeemed points
            if (pointsRedeemed > 0) {
                await updateUserLoyaltyPoints(userId, -pointsRedeemed);
            }
            
            // Award new points based on money spent
            if (totalSpent > 0) {
                const pointsEarned = Math.floor(totalSpent / 100);
                await updateUserLoyaltyPoints(userId, pointsEarned);
            }
        }

        // Step 3: Update stock levels
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
                // In checkout sessions, the product ID is on the product object itself
                const productId = product.id; 
                const quantitySold = item.quantity || 0;
                
                if (productId && quantitySold > 0) {
                    await updateStock(productId, quantitySold);
                }
            }
        }
    } catch (error: any) {
        console.error('Error processing checkout session:', error);
        return NextResponse.json({ error: `Webhook handler failed: ${error.message}` }, { status: 500 });
    }
  }

  // --- Handle product.updated event for stock notifications ---
  if (event.type === 'product.updated') {
    const product = event.data.object as Stripe.Product;
    const previousAttributes = event.data.previous_attributes as Partial<Stripe.Product> | undefined;

    const oldStockStr = previousAttributes?.metadata?.stock;
    const newStockStr = product.metadata.stock;

    if (oldStockStr !== undefined && newStockStr !== undefined) {
        const oldStock = parseInt(oldStockStr, 10);
        const newStock = parseInt(newStockStr, 10);

        // Check if product has been restocked (from 0 or less to > 0)
        if (oldStock <= 0 && newStock > 0) {
            console.log(`✅ Product restocked: ${product.name} (ID: ${product.id}). New stock: ${newStock}`);

            try {
                // Find all pending notifications for this product
                const subscriptionsRef = collection(db, 'stockSubscriptions');
                const q = query(subscriptionsRef, where('productId', '==', product.id), where('notified', '==', false));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const batch = writeBatch(db);
                    
                    console.log(`INFO: Found ${querySnapshot.docs.length} subscribers for ${product.name}. Triggering Klaviyo events.`);

                    for (const docSnapshot of querySnapshot.docs) {
                        const email = docSnapshot.data().email;
                        
                        // Trigger Klaviyo event
                        await triggerKlaviyoBackInStock(email, product);

                        // Mark as notified in Firestore
                        batch.update(docSnapshot.ref, { notified: true });
                    }

                    // Commit the batch update to mark all as notified
                    await batch.commit();
                    console.log(`✅ Successfully processed and marked ${querySnapshot.docs.length} notifications as sent.`);
                } else {
                    console.log(`INFO: No pending subscribers found for restocked product ${product.name}.`);
                }
            } catch (dbError) {
                 console.error(`❌ Error processing stock notifications for product ${product.id}:`, dbError);
            }
        }
    }
  }


  // Acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
