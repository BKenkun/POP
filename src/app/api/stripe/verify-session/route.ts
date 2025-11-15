import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { firestore } from '@/lib/firebase-admin';
import { serverTimestamp } from 'firebase-admin/firestore';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { CartItem } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';


if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = firestore;

export async function POST(req: NextRequest) {
    const { session_id } = await req.json();

    if (!session_id) {
        return NextResponse.json({ success: false, error: 'Session ID no proporcionado.' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items.data.price.product'],
        });

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ success: false, error: 'El pago no ha sido completado.' }, { status: 402 });
        }
        
        const customerEmail = session.customer_details?.email;
        if (!customerEmail) {
            throw new Error("No se pudo obtener el email del cliente de la sesión de Stripe.");
        }
        
        // Use a unique ID based on the Stripe session to prevent duplicate orders
        const orderId = `stripe_${session.id}`;
        
        // Determine the correct collection path
        const userId = session.metadata?.userId || 'guest';
        if (!userId) throw new Error("User ID is missing from session metadata.");

        const orderDocRef = db.doc(`users/${userId}/orders/${orderId}`);

        // Check if the order already exists to prevent duplication
        const orderDocSnap = await orderDocRef.get();
        if (orderDocSnap.exists) {
            console.log(`El pedido ${orderId} ya existe. Verificación exitosa.`);
            return NextResponse.json({ success: true, message: 'El pedido ya fue procesado.', orderId: orderId });
        }
        
        const lineItems = session.line_items?.data || [];
        const orderItems = lineItems.map(item => {
            const product = item.price?.product as Stripe.Product;
            return {
                // The productId was stored in the metadata during session creation
                productId: product.metadata.productId || item.price?.id || 'unknown_id',
                name: product.name,
                price: item.price?.unit_amount || 0,
                quantity: item.quantity || 0,
                imageUrl: product.images?.[0] || '',
            };
        });

        const orderData = {
            id: orderId,
            userId: userId,
            status: 'Reserva Recibida' as const,
            total: session.amount_total || 0,
            items: orderItems,
            customerName: session.customer_details?.name || 'N/A',
            customerEmail: customerEmail,
            shippingAddress: {
                line1: session.shipping_details?.address?.line1 || null,
                line2: session.shipping_details?.address?.line2 || null,
                city: session.shipping_details?.address?.city || null,
                state: session.shipping_details?.address?.state || null,
                postal_code: session.shipping_details?.address?.postal_code || null,
                country: session.shipping_details?.address?.country || null,
                phone: session.customer_details?.phone || null,
            },
            paymentMethod: 'stripe' as const,
            createdAt: serverTimestamp(),
        };

        await orderDocRef.set(orderData);

        const klaviyoOrderData = await formatOrderForKlaviyo({ ...orderData, id: orderId, createdAt: new Date() }, orderId);
        await trackKlaviyoEvent('Placed Order', customerEmail, klaviyoOrderData);
        
        return NextResponse.json({ success: true, orderId: orderId });

    } catch (error: any) {
        console.error('Error al verificar la sesión de Stripe:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor al verificar la sesión.' }, { status: 500 });
    }
}
