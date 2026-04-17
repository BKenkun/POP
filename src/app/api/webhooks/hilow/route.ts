'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V2.0 - CICLO DE VIDA COMPLETO)
 * Implementa la lógica oficial confirmada por Hilow para gestionar suscripciones.
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
    // Hilow envía la firma en 'hilow-signature'
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
            console.error("🚨 FIRMA INVÁLIDA: El webhook no coincide con el secreto configurado.");
            return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
        }

        // 2. PROCESAMIENTO DEL EVENTO
        const payload = JSON.parse(body);
        const { internalOrderId, eventType, hilowOrderId, amountInCents } = payload;

        if (!internalOrderId || typeof internalOrderId !== 'string') {
            return NextResponse.json({ error: 'internalOrderId no válido' }, { status: 400 });
        }

        /**
         * Mapeo de Usuario: "SUB_uid_timestamp"
         * Extraemos el UID que está en la segunda posición (índice 1)
         */
        const parts = internalOrderId.split('_');
        if (parts.length < 2) {
            return NextResponse.json({ error: 'Formato de ID incompatible' }, { status: 400 });
        }

        const userId = parts[1];
        const userRef = adminFirestore.collection('users').doc(userId);
        
        // Generamos un ID de documento único para el pedido. 
        // Si es una renovación, usamos el timestamp para no sobreescribir el pedido anterior en la lista del usuario.
        const uniqueOrderIdForDb = eventType === 'payment.completed' ? internalOrderId : `${internalOrderId}_${Date.now()}`;
        const orderRef = userRef.collection('orders').doc(uniqueOrderIdForDb);
        
        console.log(`[WEBHOOK] Procesando ${eventType} para el usuario: ${userId}`);

        const batch = adminFirestore.batch();

        switch (eventType) {
            case 'payment.completed':
            case 'payment.renewal_succeeded':
                // ÉXITO: ACTIVAR O RENOVAR ACCESO
                batch.set(userRef, { 
                    isSubscribed: true,
                    subscriptionStatus: 'active',
                    lastSubscriptionPayment: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp()
                }, { merge: true });

                // Registrar el pedido en el historial del usuario
                // Nota: items[] es un placeholder para que el perfil de usuario se vea bien
                batch.set(orderRef, {
                    userId,
                    id: uniqueOrderIdForDb,
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
                });

                // Sumar puntos de fidelidad (1 punto por cada 10€)
                const points = Math.floor((amountInCents || 4400) / 1000);
                if (points > 0) {
                    batch.update(userRef, { loyaltyPoints: FieldValue.increment(points) });
                }
                break;

            case 'payment.failed':
                // FALLO: SUSPENDER ACCESO POR IMPAGO
                console.log(`⚠️ Pago fallido para usuario ${userId}. Marcando como past_due.`);
                batch.update(userRef, { 
                    subscriptionStatus: 'past_due',
                    updatedAt: FieldValue.serverTimestamp()
                });
                break;

            case 'subscription.cancelled':
                // CANCELACIÓN: QUITAR ACCESO DEFINITIVAMENTE
                console.log(`🚫 Suscripción cancelada para usuario ${userId}.`);
                batch.update(userRef, { 
                    isSubscribed: false,
                    subscriptionStatus: 'cancelled',
                    updatedAt: FieldValue.serverTimestamp()
                });
                break;

            default:
                console.log(`ℹ️ Evento informativo recibido: ${eventType}`);
        }

        // Ejecutar todos los cambios de forma atómica
        await batch.commit();

        // Notificar a Klaviyo tras el éxito (opcional, si hay datos de orden)
        if (eventType.includes('payment') && !eventType.includes('failed')) {
            const finalDoc = await orderRef.get();
            if (finalDoc.exists) {
                await trackOrderStatusUpdate({ ...finalDoc.data(), id: uniqueOrderIdForDb } as Order, 'order_received');
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (err: any) {
        console.error("❌ Error Crítico en el Webhook:", err.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
