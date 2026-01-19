import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

const HILOW_WEBHOOK_SECRET = process.env.HILOW_WEBHOOK_SECRET;

/**
 * Verify the webhook signature from Hilow to ensure it's authentic.
 */
async function verifySignature(req: NextRequest): Promise<string> {
    if (!HILOW_WEBHOOK_SECRET) {
        throw new Error('El secreto del webhook de Hilow no está configurado en el servidor.');
    }

    const signature = req.headers.get('x-hilow-signature');
    if (!signature) {
        throw new Error('Falta la cabecera de la firma del webhook.');
    }

    const body = await req.text(); // Read body as text to verify signature
    const hmac = crypto.createHmac('sha256', HILOW_WEBHOOK_SECRET);
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
        throw new Error('Firma del webhook inválida.');
    }

    return body; // Return the body so it can be parsed as JSON later
}

/**
 * Updates the local order in our Firestore database.
 * This is where the business logic for a successful payment goes.
 */
async function updateLocalOrder(internalOrderId: string) {
    console.log(`Procesando pedido confirmado: ${internalOrderId}`);
    
    // The order ID contains the user ID, e.g., 'CPO_abcde_167...'
    const parts = internalOrderId.split('_');
    if (parts.length < 3) {
        console.error(`ID de pedido inválido, no se pudo extraer el ID de usuario: ${internalOrderId}`);
        return;
    }
    const userId = parts[1];
    const orderRef = adminFirestore.collection('users').doc(userId).collection('orders').doc(internalOrderId);
    
    try {
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            throw new Error(`El pedido ${internalOrderId} no fue encontrado en nuestra base de datos.`);
        }
        
        const localOrderData = orderSnap.data() as Order;
        
        // Prevent processing already completed orders
        if (localOrderData.status !== 'Pago Pendiente de Verificación') {
            console.log(`El pedido ${internalOrderId} ya fue procesado. Estado actual: ${localOrderData.status}`);
            return;
        }

        const newStatus = 'Reserva Recibida';
        const batch = adminFirestore.batch();

        // 1. Update order status
        batch.update(orderRef, { status: newStatus });

        // 2. Increment coupon usage if one was used
        if ((localOrderData as any).coupon) {
          const couponRef = adminFirestore.collection('coupons').doc((localOrderData as any).coupon.code);
          batch.update(couponRef, { usageCount: FieldValue.increment(1) });
        }
        
        // 3. Add loyalty points
        const pointsToAdd = Math.floor((localOrderData.total || 0) / 1000);
        if (pointsToAdd > 0) {
          const userRef = adminFirestore.collection('users').doc(userId);
          batch.update(userRef, { 
            loyaltyPoints: FieldValue.increment(pointsToAdd) 
          });
        }
        
        await batch.commit();
        console.log(`Pedido ${internalOrderId} actualizado a "${newStatus}" y puntos/cupón aplicados.`);
        
        // 4. Send confirmation email via Klaviyo
        await trackOrderStatusUpdate({...localOrderData, id: internalOrderId, status: newStatus}, newStatus);

    } catch (error) {
        console.error(`Error al actualizar el pedido local ${internalOrderId}:`, error);
        // Optionally, send an alert to admins here
    }
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await verifySignature(req);
        const event = JSON.parse(rawBody);

        // Process the event based on its type
        if (event.type === 'payment.succeeded') {
            const { internalOrderId } = event.data;
            if (internalOrderId) {
                await updateLocalOrder(internalOrderId);
            } else {
                 console.warn('Webhook de pago exitoso recibido sin internalOrderId.');
            }
        } else {
            console.log(`Webhook de tipo "${event.type}" recibido y no procesado.`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Error en el webhook de Hilow:', error.message);
        return new NextResponse(`Error en el Webhook: ${error.message}`, { status: 400 });
    }
}
