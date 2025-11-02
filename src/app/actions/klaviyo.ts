
'use server';

import { Order, OrderItem, Product } from "@/lib/types";

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_API_REVISION = '2024-02-15';

if (!KLAVIYO_API_KEY) {
    console.warn("Klaviyo API Key is not set. Marketing and transactional emails will be simulated.");
}

/**
 * Sends a specific event to the Klaviyo Events API.
 * This is used for transactional emails like order confirmations.
 * @param eventName The name of the event to track.
 * @param customerEmail The email address of the customer.
 * @param properties An object containing data about the event.
 */
export async function trackKlaviyoEvent(eventName: 'Placed Order' | 'Admin New Order Notification' | 'Admin New User Notification', customerEmail: string, properties: { [key: string]: any }) {
    if (!KLAVIYO_API_KEY) {
        console.log(`[SIMULATION] Klaviyo event '${eventName}' tracked for ${customerEmail}.`);
        return { success: true, message: 'Simulated event tracking.' };
    }
    
    const payload = {
        data: {
            type: "event",
            attributes: {
                profile: { email: customerEmail },
                metric: { name: eventName },
                properties: properties,
            }
        }
    };

    try {
        const response = await fetch('https://a.klaviyo.com/api/events/', {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'accept': 'application/json',
                'content-type': 'application/json',
                'revision': KLAVIYO_API_REVISION
            },
            body: JSON.stringify(payload)
        });
        
        if (response.status !== 202) {
            const errorData = await response.json();
            // Try to create the metric if it doesn't exist
            if (errorData.errors?.[0]?.detail.includes("does not exist")) {
                console.warn(`Klaviyo metric '${eventName}' does not exist. Attempting to create it with a simple event.`);
                await trackKlaviyoEvent(eventName, customerEmail, { note: "Metric creation trigger" });
                // Retry the original event
                return trackKlaviyoEvent(eventName, customerEmail, properties);
            }
            throw new Error(errorData.errors?.[0]?.detail || 'Could not track event.');
        }

        console.log(`✅ Successfully tracked Klaviyo event '${eventName}' for ${customerEmail}.`);
        return { success: true };

    } catch (error: any) {
        console.error(`❌ Failed to send event '${eventName}' to Klaviyo:`, error);
        return { success: false, message: error.message || 'An internal server error occurred.' };
    }
}


/**
 * Creates or updates a product in the Klaviyo Catalog.
 * This function is called automatically when a product is saved in the admin panel.
 * @param product The product data from the store.
 */
export async function syncKlaviyoProduct(product: Product) {
    if (!KLAVIYO_API_KEY) {
        console.log(`[SIMULATION] Klaviyo product sync for '${product.name}'.`);
        return { success: true, message: 'Simulated product sync.' };
    }

    // Klaviyo uses the product ID as the foreign key.
    const itemId = product.id;

    const payload = {
        data: {
            type: 'catalog-item',
            id: itemId,
            attributes: {
                // external_id: product.sku || product.id, // Using product.id as the primary identifier
                title: product.name,
                description: product.description || 'Sin descripción.',
                url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product.id}`,
                image_full_url: product.imageUrl,
                // price must be a number, not a formatted string
                price: product.price / 100, 
                // You can add more attributes here as needed, like inventory_quantity
                inventory_quantity: product.stock,
                custom_metadata: {
                    brand: product.brand,
                    size: product.size,
                    composition: product.composition,
                    is_on_sale: !!product.originalPrice && product.originalPrice > product.price
                }
            }
        }
    };
    
    // We use a PUT request with the item ID to create or update (upsert) the item.
    const url = `https://a.klaviyo.com/api/catalog-items/${itemId}/`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                'accept': 'application/json',
                'content-type': 'application/json',
                'revision': KLAVIYO_API_REVISION,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.detail || 'Could not sync product with Klaviyo.');
        }
        
        console.log(`✅ Successfully synced product '${product.name}' with Klaviyo.`);
        return { success: true };

    } catch (error: any) {
        console.error(`❌ Failed to sync product '${product.name}' with Klaviyo:`, error);
        return { success: false, message: error.message || 'An internal server error occurred.' };
    }
}


// --- Helper Functions to format data for Klaviyo ---

export async function formatOrderForKlaviyo(order: Order, orderId: string) {
    const orderDate = order.createdAt instanceof Date 
        ? order.createdAt.toISOString() 
        // Handle Firestore serverTimestamp which might not be resolved yet on client
        : new Date().toISOString();
    
    return {
      // Event-specific properties
      '$event_id': orderId,
      '$value': order.total / 100,
      'OrderId': orderId,
      'ItemNames': order.items.map(item => item.name),
      'ItemCount': order.items.reduce((acc, item) => acc + item.quantity, 0),
      'ShippingAddress': order.shippingAddress,
      'PaymentMethod': order.paymentMethod,
      'Status': order.status,
      'Items': order.items.map(formatOrderItemForKlaviyo),
      'OrderDate': orderDate,
      
      // Customer properties
      'CustomerName': order.customerName,
    };
}

function formatOrderItemForKlaviyo(item: OrderItem) {
    return {
        'ProductID': item.productId,
        'SKU': item.productId,
        'ProductName': item.name,
        'Quantity': item.quantity,
        'ItemPrice': item.price / 100,
        'RowTotal': (item.price * item.quantity) / 100,
        'ImageURL': item.imageUrl,
        'Categories': [],
        'Brand': '',
    };
}
