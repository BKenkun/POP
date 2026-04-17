'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V1.5 - CICLO DE VIDA DE SUSCRIPCIÓN)
 * Implementa la lógica oficial de Hilow para activar, renovar y cancelar suscripciones.
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
            console.error("🚨 FIRMA INVÁLIDA: El webhook no proviene de Hilow.");
            return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
        }

        // 2. PROCESAMIENTO DEL EVENTO
        const payload = JSON.parse(body);
        const { internalOrderId, eventType, hilowOrderId } = payload;

        if (!internalOrderId || typeof internalOrderId !== 'string') {
            console.error("[WEBHOOK] internalOrderId no válido.");
            return NextResponse.json({ error: 'ID no válido' }, { status: 400 });
        }

        // Formato esperado: "SUB_uid_timestamp" o "CPO_uid_timestamp"
        const parts = internalOrderId.split('_');
        if (parts.length < 2) {
            console.error(`[WEBHOOK] Formato de ID inválido: ${internalOrderId}`);
            return NextResponse.json({ error: 'Formato ID inválido' }, { status: 400 });
        }

        const userId = parts[1];
        const userRef = adminFirestore.collection('users').doc(userId);
        const orderRef = userRef.collection('orders').doc(internalOrderId);
        
        console.log(`[WEBHOOK] Evento: ${eventType} | Usuario: ${userId} | Orden: ${hilowOrderId}`);

        const batch = adminFirestore.batch();

        switch (eventType) {
            case 'payment.completed':
            case 'payment.renewal_succeeded':
            case 'payment.succeeded':
                // ÉXITO: ACTIVAR O RENOVAR
                console.log(`✅ Activando/Renovando acceso para: ${userId}`);
                
                // Actualizar perfil de usuario
                batch.set(userRef, { 
                    isSubscribed: true,
                    subscriptionStatus: 'active',
                    lastSubscriptionPayment: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp()
                }, { merge: true });

                // Actualizar o crear registro de pedido
                const orderSnap = await orderRef.get();
                if (orderSnap.exists) {
                    batch.update(orderRef, { 
                        status: 'order_received',
                        paidAt: FieldValue.serverTimestamp(),
                        hilowPaymentId: hilowOrderId,
                        lastEventType: eventType
                    });
                } else {
                    // Si es una renovación automática, el pedido no existe previamente en nuestra DB
                    batch.set(orderRef, {
                        userId,
                        id: internalOrderId,
                        total: payload.amountInCents || 4400,
                        status: 'order_received',
                        paymentMethod: 'hilow',
                        createdAt: FieldValue.serverTimestamp(),
                        paidAt: FieldValue.serverTimestamp(),
                        isSubscription: true,
                        customerEmail: payload.email || 'customer@hilow.com'
                    });
                }

                // Sumar puntos de fidelidad (1 punto por cada 10€)
                const amount = payload.amountInCents || 4400;
                const points = Math.floor(amount / 1000);
                if (points > 0) {
                    batch.update(userRef, { loyaltyPoints: FieldValue.increment(points) });
                }
                break;

            case 'payment.failed':
                // FALLO: SUSPENDER ACCESO
                console.log(`⚠️ Fallo de pago para: ${userId}`);
                batch.update(userRef, { 
                    subscriptionStatus: 'past_due',
                    isSubscribed: false, // Opcional: podrías dejarlo en true con un periodo de gracia
                    updatedAt: FieldValue.serverTimestamp()
                });
                break;

            case 'subscription.cancelled':
                // CANCELACIÓN: QUITAR ACCESO
                console.log(`🚫 Cancelando acceso definitivo para: ${userId}`);
                batch.update(userRef, { 
                    isSubscribed: false,
                    subscriptionStatus: 'cancelled',
                    updatedAt: FieldValue.serverTimestamp()
                });
                break;

            default:
                console.log(`ℹ️ Evento no gestionado por lógica de negocio: ${eventType}`);
        }

        // Ejecutar todos los cambios en la base de datos de forma atómica
        await batch.commit();
        console.log(`✅ Base de datos sincronizada correctamente para ${internalOrderId}`);

        // Notificar a Klaviyo si fue un éxito (y tenemos datos de la orden)
        if (eventType.includes('payment') && !eventType.includes('failed')) {
            const finalOrderSnap = await orderRef.get();
            if (finalOrderSnap.exists) {
                const orderData = { ...finalOrderSnap.data(), id: internalOrderId } as Order;
                await trackOrderStatusUpdate(orderData, 'order_received');
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (err: any) {
        console.error("❌ Webhook Error Fatal:", err.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
