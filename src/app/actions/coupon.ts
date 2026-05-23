'use server';

import { cookies } from 'next/headers'
import { adminAuth, firestore } from '@/firebase/admin'

export interface CouponValidationResult {
    success: boolean;
    error?: string;
    couponId?: string;
    code?: string;
    discountAmount?: number;
}

export async function validateCoupon(code: string, cartTotalCents: number): Promise<CouponValidationResult> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return { success: false, error: 'Debes iniciar sesión para aplicar un cupón.' };
    let userId: string;
    try {
        const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
        userId = claims.uuid;
    } catch {
        return { success: false, error: 'Sesión inválida' };
    }

    const db = firestore();
    const normalizedCode = code.trim().toUpperCase();

    const snap = await db.collection('coupons').where('code', '==', normalizedCode).limit(1).get();
    if (snap.empty) return { success: false, error: 'Cupón no válido.' };

    const couponDoc = snap.docs[0];
    const coupon = couponDoc.data();

    if (!coupon.isActive)
        return { success: false, error: 'Este cupón no está activo.' };

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now)
        return { success: false, error: 'Este cupón aún no es válido.'};
    if (coupon.endDate && new Date(coupon.endDate) < now)
        return { success: false, error: 'Este cupón ha expirado.'};
    if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit)
        return { success: false, error: 'Este cupón ha alcanzado su límite de uso.'};
    if (coupon.minPurchase != null && cartTotalCents < coupon.minPurchase)
        return { success: false, error: `Importe mínimo para este cupón: ${coupon.minPurchase / 100}€.` };

    if (coupon.onePerUser) {
        const userOrderSnap = await db.collection('users').doc(userId)
        .collection('orders').where('coupon.code', '==', normalizedCode).limit(1).get();
        if (!userOrderSnap.empty)
            return { success: false, error: 'Ya has usado este cupón anteriormente.'};
    }

    const discountAmount = coupon.discountType === 'percentage' 
    ? Math.round((cartTotalCents * coupon.discountValue) / 100) : coupon.discountValue;

    return { success: true, couponId: couponDoc.id, code: normalizedCode, discountAmount };
}