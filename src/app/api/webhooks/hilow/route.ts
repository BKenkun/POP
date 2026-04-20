'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V4.1 - ARQUITECTURA UNIFICADA)
 * Procesa notificaciones de pagos únicos y suscripciones de forma unificada.
 * Utiliza el prefijo SUB/CPO para identificar la lógica de negocio y desembalar el ADN del ID.
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
        console.error("[WEBHOOK] Falta configuración o firma de seguridad.");
        return NextResponse.json({ error: 'Firma ausente' }, { status: 401 });
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
        const { internalOrderId, eventType, hilowOrderId, amountInCents, status } = payload;

        if (!internalOrderId || typeof internalOrderId !== 'string') {
            return NextResponse.json({ error: 'internalOrderId no válido' }, { status: 400 });
        }

        /**
         * DESEMBALAJE DEL ID (Lógica de ADN)
         * Formatos: 
         * - Suscripción: SUB_<userId>_<orderId>_<timestamp>
         * - Pedido Único: CPO_<userId>_<timestamp>
         */
        const parts = internalOrderId.split('_');
        const prefix = parts[0];
        const isSubscription = prefix === 'SUB';
        
        let userId = 'unknown';
        let orderDocId = internalOrderId; 

        if (isSubscription) {
            // Estructura SUB: [SUB, ...userIdSegs, orderId, timestamp]
            orderDocId = parts[parts.length - 2]; 
            userId = parts.slice(1, parts.length - 2).join('_');
        } else {
            // Estructura CPO: [CPO, ...userIdSegs, timestamp]
            userId = parts.slice(1, parts.length - 1).join('_');
        }

        console.log(`[WEBHOOK] Procesando ${eventType} (${prefix}) | Usuario: ${userId} | Pedido: ${orderDocId}`);

        const userRef = adminFirestore.collection('users').doc(userId);
        const batch = adminFirestore.batch();

        // Identificador final para el documento de pedido (evita colisiones en renovaciones)
        const finalOrderDocId = eventType === 'payment.renewal_succeeded' 
            ? `${orderDocId}_${Date.now()}` 
            : orderDocId;

        switch (eventType) {
            case 'payment.completed':
            case 'payment.renewal_succeeded':
                // --- CAPA 1: GESTIÓN DE ACCESO AL CLUB ---
                if (isSubscription) {
                    batch.set(userRef, { 
                        isSubscribed: true,
                        subscriptionStatus: 'active',
                        lastSubscriptionPayment: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp()
                    }, { merge: true });
                }

                // --- CAPA 2: REGISTRO CONTABLE (PEDIDO) ---
                const orderRef = userRef.collection('orders').doc(finalOrderDocId);
                
                batch.set(orderRef, {
                    status: 'order_received',
                    paidAt: FieldValue.serverTimestamp(),
                    hilowPaymentId: hilowOrderId,
                    updatedAt: FieldValue.serverTimestamp(),
                    // Si es nuevo (renovación o primera suscripción), inyectamos datos básicos
                    // Si es CPO, mergeamos con el pedido que el frontend ya creó
                    ...(isSubscription && {
                        userId,
                        id: finalOrderDocId,
                        total: amountInCents || 4400,
                        paymentMethod: 'hilow',
                        createdAt: FieldValue.serverTimestamp(),
                        isSubscription: true,
                        customerEmail: payload.email || 'member@comprarpopperonline.com',
                        customerName: payload.customerName || 'Miembro del Club',
                        items: [{
                            productId: 'subscription_club',
                            name: 'Club Dosis Mensual',
                            price: amountInCents || 4400,
                            quantity: 1,
                            imageUrl: 'https://picsum.photos/seed/sub/200/200'
                        }]
                    })
                }, { merge: true });

                // --- CAPA 3: PROGRAMA DE PUNTOS ---
                const points = Math.floor((amountInCents || 0) / 1000);
                if (points > 0) {
                    batch.update(userRef, { loyaltyPoints: FieldValue.increment(points) });
                }
                break;

            case 'payment.failed':
                if (isSubscription) {
                    batch.update(userRef, { 
                        subscriptionStatus: 'past_due',
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
                break;

            case 'subscription.cancelled':
                if (isSubscription) {
                    batch.update(userRef, { 
                        isSubscribed: false,
                        subscriptionStatus: 'cancelled',
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
                break;

            default:
                console.log(`ℹ️ Evento informativo sin acción requerida: ${eventType}`);
        }

        await batch.commit();

        // 3. NOTIFICACIÓN EXTERNA (Klaviyo)
        if (eventType.includes('payment') && status === 'success') {
            const finalDoc = await userRef.collection('orders').doc(finalOrderDocId).get();
            if (finalDoc.exists) {
                await trackOrderStatusUpdate({ ...finalDoc.data(), id: finalOrderDocId } as Order, 'order_received');
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (err: any) {
        console.error("❌ Error Crítico en el Webhook de Hilow:", err.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
