'use server';

import { Order, OrderItem } from "@/lib/types";

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
if (!KLAVIYO_API_KEY) {
    console.warn("Klaviyo API Key is not set. Transactional emails will not be sent.");
}

type EventName = 'Placed Order' | 'Admin New Order Notification' | 'Admin New User Notification';

interface EventProperties {
    [key: string]: any;
}

interface KlaviyoEvent {
    token: string;
    event: EventName;
    customer_properties: {
        $email: string;
        [key: string]: any;
    };
    properties: EventProperties;
}

/**
 * Sends a specific event to the Klaviyo Events API.
 * This is used for transactional emails like order confirmations.
 * @param eventName The name of the event to track.
 * @param customerEmail The email address of the customer.
 * @param properties An object containing data about the event.
 */
export async function trackKlaviyoEvent(eventName: EventName, customerEmail: string, properties: EventProperties) {
    if (!KLAVIYO_API_KEY) {
        console.log(`[SIMULATION] Klaviyo event '${eventName}' tracked for ${customerEmail} with properties:`, properties);
        return { success: true, message: 'Simulated event tracking.' };
    }

    const payload = {
        data: {
            type: "event",
            attributes: {
                profile: {
                    email: customerEmail
                },
                metric: {
                    name: eventName
                },
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
                'revision': '2024-02-15'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.status === 202) {
             console.log(`✅ Successfully tracked Klaviyo event '${eventName}' for ${customerEmail}.`);
             return { success: true };
        } else {
            const errorData = await response.json();
            console.error(`❌ Klaviyo API Error for event '${eventName}':`, JSON.stringify(errorData, null, 2));
            const detail = errorData.errors?.[0]?.detail || 'Could not track event.';
            return { success: false, message: detail };
        }

    } catch (error) {
        console.error(`❌ Failed to send event '${eventName}' to Klaviyo:`, error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}


// --- Helper Functions to format data for Klaviyo ---

export function formatOrderForKlaviyo(order: Order, orderId: string) {
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
        
        // Customer properties
        'CustomerName': order.customerName,
    };
}

function formatOrderItemForKlaviyo(item: OrderItem) {
    return {
        'ProductID': item.productId,
        'ProductName': item.name,
        'Quantity': item.quantity,
        'ItemPrice': item.price / 100,
        'RowTotal': (item.price * item.quantity) / 100,
        'ImageURL': item.imageUrl,
    };
}
