'use server';
/**
 * @fileoverview MANEJADOR DE WEBHOOK HILOW (V5.0 - ARQUITECTURA PRE-REGISTRO)
 * Procesa notificaciones unificadas. Para suscripciones, actualiza el pedido que ya existe.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { firestore } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { trackOrderStatusUpdate } from '@/app/actions/klaviyo';
import { Order, OrderSchemaStatus } from '@/schemas';

export async function POST(req: NextRequest) {
    const WEBHOOK_SECRET = process.env.HILOW_WEBHOOK_SECRET;
    const headerStore = headers();
    const rawSignature = headerStore.get('hilow-signature') || headerStore.get('x-hilow-signature');
    const body = await req.text();
    const adminFirestore = firestore();
 
    if (!rawSignature || !WEBHOOK_SECRET) {
        console.error("[WEBHOOK] Falta configuración o firma de seguridad.");
        return NextResponse.json({ error: 'Firma ausente' }, { status: 401 });
    }
 
    // --- Verificación HMAC ---
    try {
        const expectedSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(body)
            .digest('hex');
 
        // Validate hex encoding before creating Buffers
        if (!/^[0-9a-f]+$/i.test(rawSignature)) {
            console.error("🚨 FIRMA CON FORMATO INVÁLIDO");
            return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
        }
 
        const signatureBuffer = Buffer.from(rawSignature, 'hex');
        const expectedBuffer = Buffer.from(expectedSignature, 'hex');
 
        if (signatureBuffer.length !== expectedBuffer.length) {
            console.error("🚨 FIRMA INVÁLIDA (longitud)");
            return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
        }
 
        const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
        if (!isValid) {
            console.error("🚨 FIRMA INVÁLIDA");
            return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
        }
    } catch (err) {
        console.error("🚨 Error en verificación de firma:", err);
        return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
    }
 
    try {
        const payload = JSON.parse(body);
        const { internalOrderId, eventType, hilowOrderId, amountInCents, status } = payload;
 
        if (!internalOrderId || typeof internalOrderId !== 'string') {
            return NextResponse.json({ error: 'internalOrderId no válido' }, { status: 400 });
        }
 
        /**
         * Desempaquetado del ID estructurado:
         * - Suscripción: SUB_<userId>_<orderId>_<timestamp>
         * - Pedido normal: CPO_<userId>_<timestamp>
         */
        const parts = internalOrderId.split('_');
        const prefix = parts[0];
        const isSubscription = prefix === 'SUB';
        const isOrder = prefix === 'CPO';
 
        if (!isSubscription && !isOrder) {
            console.error(`[WEBHOOK] Prefijo desconocido en internalOrderId: ${internalOrderId}`);
            return NextResponse.json({ error: 'internalOrderId con formato inválido' }, { status: 400 });
        }
 
        let userId: string;
        let orderDocId: string = internalOrderId;
 
        if (isSubscription) {
            // SUB_<userId>_<orderId>_<timestamp>  → parts has at least 4 elements
            if (parts.length < 4) {
                console.error(`[WEBHOOK] internalOrderId SUB malformado: ${internalOrderId}`);
                return NextResponse.json({ error: 'internalOrderId malformado' }, { status: 400 });
            }
            orderDocId = parts[parts.length - 2];
            userId = parts.slice(1, parts.length - 2).join('_');
        } else {
            // CPO_<userId>_<timestamp> → parts has at least 3 elements
            if (parts.length < 3) {
                console.error(`[WEBHOOK] internalOrderId CPO malformado: ${internalOrderId}`);
                return NextResponse.json({ error: 'internalOrderId malformado' }, { status: 400 });
            }
            userId = parts.slice(1, parts.length - 1).join('_');
        }
 
        // Safety check: never process with an empty/unknown userId
        if (!userId || userId === 'unknown') {
            console.error(`[WEBHOOK] userId inválido derivado de: ${internalOrderId}`);
            return NextResponse.json({ error: 'userId inválido' }, { status: 400 });
        }
 
        console.log(`[WEBHOOK] Procesando ${eventType} | Usuario: ${userId} | Pedido: ${orderDocId}`);
 
        const userRef = adminFirestore.collection('users').doc(userId);
        const batch = adminFirestore.batch();
 
        const finalOrderDocId = eventType === 'payment.renewal_succeeded'
            ? `${orderDocId}_${Date.now()}`
            : orderDocId;
 
        switch (eventType) {
            case 'payment.completed':
            case 'payment.renewal_succeeded': {
                // 1. Activar suscripción (solo si es SUB)
                if (isSubscription) {
                    batch.set(userRef, {
                        isSubscribed: true,
                        subscriptionStatus: 'active',
                        lastSubscriptionPayment: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp()
                    }, { merge: true });
                }
 
                // 2. Actualizar pedido de pending → received
                const orderRef = userRef.collection('orders').doc(finalOrderDocId);
                batch.set(orderRef, {
                    status: 'order_received',
                    paidAt: FieldValue.serverTimestamp(),
                    hilowPaymentId: hilowOrderId,
                    updatedAt: FieldValue.serverTimestamp(),
                    ...(eventType === 'payment.renewal_succeeded' && {
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
 
                // 3. Puntos de fidelidad
                const points = Math.floor((amountInCents || 0) / 1000);
                if (points > 0) {
                    batch.update(userRef, { loyaltyPoints: FieldValue.increment(points) });
                }
 
                // 4. Incrementar usageCount del cupón (solo pedidos normales, no renovaciones)
                if (!isSubscription && eventType === 'payment.completed') {
                    const orderSnap = await orderRef.get();
                    if (orderSnap.exists) {
                        const orderData = orderSnap.data();
                        const couponId: string | undefined = orderData?.coupon?.couponId;
                        if (couponId) {
                            const couponRef = adminFirestore.collection('coupons').doc(couponId);
                            batch.update(couponRef, {
                                usageCount: FieldValue.increment(1)
                            });
                            console.log(`[WEBHOOK] Incrementando usageCount para cupón: ${couponId}`);
                        }
                    }
                }
 
                break;
            }
 
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
                console.log(`[WEBHOOK] Evento no manejado: ${eventType}`);
        }
 
        await batch.commit();
 
        if (eventType.includes('payment') && status === 'success') {
            const finalDoc = await userRef.collection('orders').doc(finalOrderDocId).get();
            if (finalDoc.exists) {
                await trackOrderStatusUpdate(
                    { ...finalDoc.data(), id: finalOrderDocId } as Order,
                    OrderSchemaStatus.OrderReceived
                );
            }
        }
 
        return NextResponse.json({ received: true }, { status: 200 });
 
    } catch (err: any) {
        console.error("❌ Error Crítico en el Webhook:", err.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}