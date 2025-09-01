
import Stripe from 'stripe';
import type { Product, CartItem } from './types';

// This is the global instance of Stripe, initialized once.
let stripe: Stripe | null = null;

const getStripeInstance = (): Stripe => {
  if (stripe) {
    return stripe;
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    // This will now clearly fail if the key is not in .env.local
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. Please create a .env.local file and add it.'
    );
  }
  stripe = new Stripe(secretKey, {
    apiVersion: '2024-06-20',
    typescript: true,
  });
  return stripe;
};

export async function getStripeProducts(): Promise<Product[]> {
  const stripe = getStripeInstance();
  const productsResponse = await stripe.products.list({
    active: true,
    limit: 20,
    expand: ['data.default_price'],
  });

  if (!productsResponse) {
    throw new Error('Failed to fetch products from Stripe.');
  }

  const availableProducts: Product[] = productsResponse.data
    .map((product: any) => {
      const price = product.default_price;
      const stock = product.metadata.stock
        ? parseInt(product.metadata.stock, 10)
        : undefined;
      
      let productDetails: Record<string, string> | undefined = undefined;
      if (product.metadata.product_details) {
        try {
          // This robust regex will find the JSON object within the string, even if it's surrounded by other text or newlines.
          const jsonMatch = product.metadata.product_details.match(/{[\s\S]*}/);
          if (jsonMatch && jsonMatch[0]) {
            // Replace single quotes with double quotes to fix common JSON format errors
            const correctedJsonString = jsonMatch[0].replace(/'/g, '"');
            productDetails = JSON.parse(correctedJsonString);
          } else {
             console.error(`No valid JSON object found in product_details for product ${product.id}`);
          }
        } catch (e) {
          console.error(`Error parsing product_details for product ${product.id}:`, e);
        }
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: price?.unit_amount || 0,
        imageUrl: product.images?.[0] || 'https://picsum.photos/400/400',
        imageHint: 'product bottle',
        tags: product.metadata.tags?.split(',').map((t: string) => t.trim()) || [],
        internalTags: product.metadata.internal_tags?.split(',').map((t: string) => t.trim()) || [],
        galleryImages:
          product.metadata.gallery_images
            ?.split(',')
            .map((url: string) => url.trim()) || [],
        stock: stock,
        productDetails: productDetails,
      };
    })
    .filter((p) => p.price > 0);

  return availableProducts;
}

export async function createCheckoutSession(
  items: CartItem[]
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
  try {
    const stripe = getStripeInstance();
    const line_items = items.map((item) => {
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : [],
            description: item.description,
            // Pass product ID to metadata for stock updates
            metadata: {
              productId: item.id,
            },
          },
          unit_amount: item.price, // Price in cents
        },
        quantity: item.quantity,
      };
    });

    const YOUR_DOMAIN =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

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
