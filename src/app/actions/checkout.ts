'use server';

import { firestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface CheckoutOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CheckoutOrderData {
  orderId: string;
  userId: string;
  items: CheckoutOrderItem[];
  total: number;
  shippingCost: number;
  shippingFree: boolean;
  packlink?: {
    serviceId: string;
    serviceName: string;
    carrierName: string;
    quotedPrice: number;
    currency: string;
    status: string;
  };
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  status: string;
  paymentMethod: string;
  coupon?: {
    code: string;
    discount: number;
    discountType?: string;
  };
  isGuest?: boolean;
}

/**
 * Guarda el pedido en Firestore de manera segura desde el servidor.
 * Funciona tanto para usuarios registrados como para pedidos de invitados.
 */
export async function createCheckoutOrder(data: CheckoutOrderData): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = (data.userId && data.userId !== 'guest') ? data.userId : 'guest';
    const orderDocId = data.orderId;

    if (!orderDocId) {
      return { success: false, error: 'Identificador de pedido inválido.' };
    }

    const orderRef = firestore.collection('users').doc(userId).collection('orders').doc(orderDocId);

    await orderRef.set({
      ...data,
      id: orderDocId,
      userId,
      isGuest: userId === 'guest',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Si se usó un cupón, incrementar su contador de usos en Firestore
    if (data.coupon?.code) {
      try {
        const couponSnap = await firestore
          .collection('coupons')
          .where('code', '==', data.coupon.code.toUpperCase())
          .limit(1)
          .get();
        if (!couponSnap.empty) {
          await couponSnap.docs[0].ref.update({
            usageCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      } catch (couponErr) {
        console.warn('[createCheckoutOrder] No se pudo incrementar usageCount del cupón:', couponErr);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[createCheckoutOrder] Error creating order in Firestore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al guardar el pedido en Firestore.',
    };
  }
}

/**
 * Consulta el estado de un pedido (usado por la pantalla de confirmación para invitados o usuarios).
 */
export async function getCheckoutOrderStatus(orderId: string, userId?: string): Promise<{
  exists: boolean;
  status?: string;
  total?: number;
  customerName?: string;
  customerEmail?: string;
  isGuest?: boolean;
}> {
  try {
    const uid = userId || (orderId.includes('_guest_') || orderId.startsWith('CPO_guest_') ? 'guest' : null);

    if (uid) {
      const snap = await firestore.collection('users').doc(uid).collection('orders').doc(orderId).get();
      if (snap.exists) {
        const d = snap.data();
        return {
          exists: true,
          status: d?.status,
          total: d?.total,
          customerName: d?.customerName,
          customerEmail: d?.customerEmail,
          isGuest: d?.isGuest ?? (uid === 'guest'),
        };
      }
    }

    // Si no sabemos el userId, buscar en la colección de pedidos
    const groupSnap = await firestore.collectionGroup('orders').where('id', '==', orderId).limit(1).get();
    if (!groupSnap.empty) {
      const d = groupSnap.docs[0].data();
      return {
        exists: true,
        status: d?.status,
        total: d?.total,
        customerName: d?.customerName,
        customerEmail: d?.customerEmail,
        isGuest: d?.isGuest ?? (d?.userId === 'guest'),
      };
    }

    return { exists: false };
  } catch (error) {
    console.error('[getCheckoutOrderStatus] Error checking order status:', error);
    return { exists: false };
  }
}
