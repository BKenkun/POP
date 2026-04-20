'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V3.0 - ARQUITECTURA UNIFICADA)
 * Implementa la lógica de "ADN de Pedido" para gestionar compras únicas y suscripciones.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { firestore as adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order } from '@/lib/types';

export async function POST(req: NextRequest) {
    const WEBHOOK_SECRET = process.env.HILOW_WEBHOOK_SECRET;
    const headerStore = headers();
    const signature = headerStore.get('hilow-signature') || headerStore.get('x-hilow-signature');
    const body = await req.text();

    if (!signature || !WEBHOOK_SECRET) {
        console.error("[WEBHOOK] Falta configuración o firma.");
        return NextResponse.json({ error: 'Configuración o firma ausente' }, { status: 401 });
    }

    try {
        // 1. VALIDACIÓN DE SEGURIDAD (HMAC-SHA256)
        const expectedSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error("🚨 FIRMA INVÁLIDA: El webhook no coincide con el secreto.");
            return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
        }

        // 2. PROCESAMIENTO DEL EVENTO
        const payload = JSON.parse(body);
        const { internalOrderId, eventType, hilowOrderId, amountInCents, status } = payload;

        if (!internalOrderId || typeof internalOrderId !== 'string') {
            return NextResponse.json({ error: 'internalOrderId no válido' }, { status: 400 });
        }

        /**
         * DESEMBALAJE DEL ID (Lógica de ADN)
         * Formatos soportados: 
         * - Suscripción: SUB_<userId>_<orderId>_<timestamp>
         * - Pedido Único: CPO_<userId>_<timestamp>
         */
        const parts = internalOrderId.split('_');
        const prefix = parts[0];
        
        // El timestamp siempre es el último
        // El orderId en suscripciones es el penúltimo. En CPO, el ID entero es el orderId.
        const isSubscription = prefix === 'SUB';
        
        let userId = 'unknown';
        let orderDocId = internalOrderId; // Por defecto para CPO

        if (isSubscription) {
            // Estructura: SUB [0], UID [1...n-2], ORDERID [n-2], TIMESTAMP [n-1]
            // Esto permite que el UID contenga guiones bajos de forma segura.
            orderDocId = parts[parts.length - 2];
            userId = parts.slice(1, parts.length - 2).join('_');
        } else {
            // Estructura CPO: CPO [0], UID [1...n-1], TIMESTAMP [n-1]
            userId = parts.slice(1, parts.length - 1).join('_');
        }

        console.log(`[WEBHOOK] Procesando ${eventType} (${prefix}) para Usuario: ${userId} | Pedido: ${orderDocId}`);

        const userRef = adminFirestore.collection('users').doc(userId);
        const batch = adminFirestore.batch();

        switch (eventType) {
            case 'payment.completed':
            case 'payment.renewal_succeeded':
                // --- CAPA 1: ACTIVACIÓN DE SUSCRIPCIÓN ---
                if (isSubscription) {
                    batch.set(userRef, { 
                        isSubscribed: true,
                        subscriptionStatus: 'active',
                        lastSubscriptionPayment: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp()
                    }, { merge: true });
                }

                // --- CAPA 2: REGISTRO DE PEDIDO (Historial) ---
                // Para renovaciones, generamos un ID de documento único añadiendo el timestamp de Hilow
                const finalOrderDocId = eventType === 'payment.renewal_succeeded' 
                    ? `${orderDocId}_${Date.now()}` 
                    : orderDocId;

                const orderRef = userRef.collection('orders').doc(finalOrderDocId);
                
                // Si es un pedido único (CPO), el documento ya existe, solo actualizamos estado.
                // Si es suscripción (SUB), creamos los detalles desde el ID.
                if (isSubscription) {
                    batch.set(orderRef, {
                        userId,
                        id: finalOrderDocId,
                        total: amountInCents || 4400,
                        status: 'order_received',
                        paymentMethod: 'hilow',
                        createdAt: FieldValue.serverTimestamp(),
                        paidAt: FieldValue.serverTimestamp(),
                        isSubscription: true,
                        hilowPaymentId: hilowOrderId,
                        customerEmail: payload.email || 'member@comprarpopperonline.com',
                        customerName: payload.customerName || 'Miembro del Club',
                        items: [
                            {
                                productId: 'subscription_club',
                                name: 'Club Dosis Mensual',
                                price: amountInCents || 4400,
                                quantity: 1,
                                imageUrl: 'https://picsum.photos/seed/sub/200/200'
                            }
                        ]
                    }, { merge: true });
                } else {
                    batch.set(orderRef, {
                        status: 'order_received',
                        paidAt: FieldValue.serverTimestamp(),
                        hilowPaymentId: hilowOrderId,
                        updatedAt: FieldValue.serverTimestamp()
                    }, { merge: true });
                }

                // --- CAPA 3: PUNTOS DE FIDELIDAD ---
                const points = Math.floor((amountInCents || 0) / 1000);
                if (points > 0) {
                    batch.update(userRef, { loyaltyPoints: FieldValue.increment(points) });
                }
                break;

            case 'payment.failed':
                // Suspensión de acceso por impago (Sigue suscrito pero en aviso)
                if (isSubscription) {
                    batch.update(userRef, { 
                        subscriptionStatus: 'past_due',
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
                break;

            case 'subscription.cancelled':
                // Revocación definitiva de acceso
                if (isSubscription) {
                    batch.update(userRef, { 
                        isSubscribed: false,
                        subscriptionStatus: 'cancelled',
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
                break;

            default:
                console.log(`ℹ️ Evento informativo recibido: ${eventType}`);
        }

        // Ejecutar cambios
        await batch.commit();

        // Notificar a Klaviyo (Opcional, basado en el estado final)
        if (eventType.includes('payment') && status === 'success') {
            const finalDoc = await userRef.collection('orders').doc(orderDocId).get();
            if (finalDoc.exists) {
                await trackOrderStatusUpdate({ ...finalDoc.data(), id: orderDocId } as Order, 'order_received');
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (err: any) {
        console.error("❌ Error Crítico en el Webhook:", err.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
