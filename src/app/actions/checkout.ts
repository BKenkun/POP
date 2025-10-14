
'use server';

import { firestore } from '@/lib/firebase-admin';
import { CartItem, Order, ShippingAddress } from '@/lib/types';
import { auth } from 'firebase-admin';

// Helper function to generate a unique order code
const generateOrderCode = (): string => {
  const prefix = "P";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = '';
  for (let i = 0; i < 7; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix}-${result}`;
}


interface CreateOrderParams {
    userId: string;
    cartItems: CartItem[];
    cartTotal: number;
    customerName: string;
    customerEmail: string;
    shippingAddress: ShippingAddress;
    paymentMethod: Order['paymentMethod'];
}

/**
 * Creates an order in Firestore for the specified user.
 * This is a server action to ensure secure creation of orders.
 */
export async function createOrder(params: CreateOrderParams): Promise<{ orderId: string | null; error: string | null }> {
    const { userId, cartItems, cartTotal, customerName, customerEmail, shippingAddress, paymentMethod } = params;

    if (!userId || !cartItems || cartItems.length === 0) {
        return { orderId: null, error: 'Faltan datos del usuario o del carrito.' };
    }

    try {
        const orderId = generateOrderCode();
        
        const itemsForPayload = cartItems.map(item => {
            // Ensure the image URL is the original one, not a proxied version
            const originalUrl = item.imageUrl.includes('/api/image-proxy?url=')
                ? decodeURIComponent(item.imageUrl.split('url=')[1] || '')
                : item.imageUrl;

            return { 
                productId: item.id, 
                name: item.name, 
                price: item.price, 
                quantity: item.quantity, 
                imageUrl: originalUrl 
            };
        });

        // The path to the user's specific orders subcollection
        const orderDocRef = firestore.collection('users').doc(userId).collection('orders').doc(orderId);

        const orderPayload: Omit<Order, 'id' | 'createdAt'> = {
            userId,
            status: 'Reserva Recibida',
            total: cartTotal,
            items: itemsForPayload,
            customerName,
            customerEmail,
            shippingAddress,
            paymentMethod,
        };

        await orderDocRef.set({
            ...orderPayload,
            createdAt: new Date(), // Use server timestamp for consistency
        });

        console.log(`Order ${orderId} created successfully for user ${userId}`);
        
        return { orderId, error: null };

    } catch (error: any) {
        console.error("Error creating order in server action:", error);
        return { orderId: null, error: error.message || 'No se pudo crear el pedido.' };
    }
}
