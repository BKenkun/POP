'use server';

import { cookies } from 'next/headers';
import { adminAuth, firestore } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

interface CheckoutItem {
    productId: string;
    quantity: number;
}

interface CheckoutShippingAddress {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
}

interface CheckoutPayload {
    items: CheckoutItem[];
    shippingAddress: CheckoutShippingAddress;
    customerName: string;
    customerEmail: string;
    couponId?: string;
    couponCode?: string;
    couponDiscount?: number; // kept for reference, NOT trusted for final price
}

/**
 * Server action to initiate a Hilow checkout for a regular (non-subscription) order.
 *
 * Security model:
 * 1. Authenticates the user from the session cookie.
 * 2. Reads product prices from Firestore — prices NEVER come from the client.
 * 3. Re-validates the coupon (if any) server-side before applying it.
 * 4. Creates the pending order in Firestore with the server-verified total.
 * 5. Calls the Hilow API with the server-calculated amount.
 */
export async function createHilowApiOrder(
    payload: CheckoutPayload
): Promise<{ success: boolean; checkoutUrl?: string; orderId?: string; message?: string }> {
    try {
        // --- 1. Verify session ---
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) {
            return { success: false, message: 'Debes iniciar sesión para completar la compra.' };
        }

        let userId: string;
        try {
            const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
            userId = claims.uid;
        } catch {
            return { success: false, message: 'Sesión inválida o expirada.' };
        }

        const HILOW_API_KEY = process.env.HILOW_API_KEY;
        const HILOW_STORE_ID = process.env.HILOW_STORE_ID;
        const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
        const HILOW_API_ENDPOINT = 'https://hilowglobal.com/api/orders';

        if (!HILOW_API_KEY || !HILOW_STORE_ID || !APP_BASE_URL) {
            console.error('[HILOW] Missing server environment variables.');
            return { success: false, message: 'Configuración de servidor incompleta.' };
        }

        const db = firestore();

        // --- 2. Load & verify product prices from Firestore ---
        const { items, shippingAddress, customerName, customerEmail, couponId, couponCode } = payload;

        if (!items || items.length === 0) {
            return { success: false, message: 'El carrito está vacío.' };
        }

        const productSnapshots = await Promise.all(
            items.map(item => db.collection('products').doc(item.productId).get())
        );

        let subtotal = 0;
        const verifiedItems = productSnapshots.map((snap, i) => {
            if (!snap.exists) {
                throw new Error(`Producto no encontrado: ${items[i].productId}`);
            }
            const product = snap.data()!;
            if (product.active === false) {
                throw new Error(`El producto "${product.name}" ya no está disponible.`);
            }
            const price = product.price as number; // cents, from Firestore
            const quantity = items[i].quantity;
            subtotal += price * quantity;
            return {
                productId: snap.id,
                name: product.name as string,
                price,
                quantity,
                imageUrl: product.imageUrl as string,
            };
        });

        // --- 3. Server-side volume discount (mirrors cart-context logic) ---
        const totalQuantity = verifiedItems.reduce((acc, item) => acc + item.quantity, 0);
        let volumeDiscount = 0;
        if (totalQuantity >= 3 && totalQuantity <= 5) {
            volumeDiscount = Math.round(subtotal * 0.05);
        } else if (totalQuantity >= 6 && totalQuantity <= 11) {
            volumeDiscount = Math.round(subtotal * 0.10);
        } else if (totalQuantity >= 12) {
            volumeDiscount = Math.round(subtotal * 0.15);
        }

        // --- 4. Re-validate coupon server-side ---
        let couponDiscountCents = 0;
        let validatedCouponCode: string | null = null;
        let validatedCouponId: string | null = null;

        if (couponId && couponCode) {
            const couponSnap = await db.collection('coupons').doc(couponId).get();
            if (couponSnap.exists) {
                const coupon = couponSnap.data()!;
                const now = new Date();
                const isActive = coupon.isActive === true;
                const notExpired = !coupon.endDate || new Date(coupon.endDate) >= now;
                const notStarted = !coupon.startDate || new Date(coupon.startDate) <= now;
                const withinLimit = coupon.usageLimit == null || coupon.usageCount < coupon.usageLimit;
                const normalizedCode = coupon.code as string;

                if (
                    isActive && notExpired && notStarted && withinLimit &&
                    normalizedCode.toUpperCase() === couponCode.toUpperCase()
                ) {
                    couponDiscountCents = coupon.discountType === 'percentage'
                        ? Math.round((subtotal * coupon.discountValue) / 100)
                        : (coupon.discountValue as number);
                    validatedCouponCode = normalizedCode;
                    validatedCouponId = couponSnap.id;
                }
            }
        }

        const finalTotal = Math.max(0, subtotal - volumeDiscount - couponDiscountCents);

        // --- 5. Pre-register pending order in Firestore ---
        const uniqueId = `CPO_${userId}_${Date.now()}`;
        const userRef = db.collection('users').doc(userId);
        const orderRef = userRef.collection('orders').doc(uniqueId);

        const pendingOrderData: Record<string, any> = {
            id: uniqueId,
            userId,
            items: verifiedItems,
            total: finalTotal,
            subtotal,
            volumeDiscount,
            customerName,
            customerEmail,
            shippingAddress,
            status: 'pending_payment',
            paymentMethod: 'hilow',
            createdAt: FieldValue.serverTimestamp(),
        };

        if (validatedCouponId && validatedCouponCode) {
            pendingOrderData.coupon = {
                couponId: validatedCouponId,
                code: validatedCouponCode,
                discount: couponDiscountCents,
            };
        }

        await orderRef.set(pendingOrderData);
        console.log(`[HILOW] Pending order created: ${uniqueId} for user: ${userId}`);

        // --- 6. Call Hilow API ---
        const hilowPayload = {
            storeId: HILOW_STORE_ID,
            internalOrderId: uniqueId,
            amountInCents: finalTotal,
            productName: verifiedItems.map(i => `${i.quantity}x ${i.name}`).join(', '),
            isSubscription: false,
            successUrl: `${APP_BASE_URL}/checkout/success?order_id=${uniqueId}`,
            cancelUrl: `${APP_BASE_URL}/products`,
        };

        const apiResponse = await fetch(HILOW_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HILOW_API_KEY}`,
            },
            body: JSON.stringify(hilowPayload),
        });

        const responseText = await apiResponse.text();
        let data: HilowApiResponse;
        try {
            data = JSON.parse(responseText);
        } catch {
            console.error('[HILOW] Invalid JSON response:', responseText);
            return { success: false, message: 'Respuesta inválida del servidor de pagos.' };
        }

        if (!apiResponse.ok) {
            console.error('[HILOW] API error:', data);
            return { success: false, message: data.message || `Error de API: ${apiResponse.status}` };
        }

        if (data.hilowOrderId) {
            const checkoutUrl = `https://hilowglobal.com/pay/${data.hilowOrderId}`;
            return { success: true, checkoutUrl, orderId: uniqueId };
        }

        return { success: false, message: 'No se generó el ID de pago correctamente.' };

    } catch (error: any) {
        console.error('[HILOW] Fatal error:', error.message);
        return { success: false, message: error.message || 'Error interno al procesar el pedido.' };
    }
}