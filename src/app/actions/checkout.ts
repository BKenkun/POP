'use server';

import { FieldValue } from 'firebase-admin/firestore';
import {
  auth,
  projectId,
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminFirestore,
  toFirestoreRestValue,
} from '@/lib/firebase-admin';

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
  idToken?: string;
}

async function createOrderViaUserRest(
  orderPayload: Omit<CheckoutOrderData, 'idToken'>,
  userId: string,
  orderDocId: string,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const decoded = await auth.verifyIdToken(idToken);
    if (decoded.uid !== userId) {
      return { success: false, error: 'La sesión del usuario no coincide con el pedido.' };
    }

    const now = new Date();
    const docFields: Record<string, unknown> = {};
    const bodyObject: Record<string, unknown> = {
      ...orderPayload,
      id: orderDocId,
      userId,
      isGuest: false,
      createdAt: now,
      updatedAt: now,
    };

    for (const [key, val] of Object.entries(bodyObject)) {
      if (val !== undefined) {
        docFields[key] = toFirestoreRestValue(val);
      }
    }

    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId
    )}/databases/(default)/documents/users/${encodeURIComponent(
      userId
    )}/orders/${encodeURIComponent(orderDocId)}`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: docFields }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        error: errText || 'No se pudo registrar el pedido con tu sesión de usuario.',
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error guardando el pedido con token de usuario.',
    };
  }
}

/**
 * Guarda el pedido en Firestore de manera segura desde el servidor.
 * Funciona tanto para usuarios registrados como para pedidos de invitados.
 */
export async function createCheckoutOrder(
  data: CheckoutOrderData
): Promise<{ success: boolean; error?: string }> {
  const { idToken, ...orderFields } = data;
  const userId = orderFields.userId && orderFields.userId !== 'guest' ? orderFields.userId : 'guest';
  const orderDocId = orderFields.orderId;

  if (!orderDocId) {
    return { success: false, error: 'Identificador de pedido inválido.' };
  }

  let credentialBlocked = !areAdminCredentialsAvailable();

  if (!credentialBlocked) {
    try {
      await runWithAdminFirestore(async (db) => {
        const orderRef = db
          .collection('users')
          .doc(userId)
          .collection('orders')
          .doc(orderDocId);

        await orderRef.set({
          ...orderFields,
          id: orderDocId,
          userId,
          isGuest: userId === 'guest',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Si se usó un cupón, incrementar su contador de usos en Firestore
        if (orderFields.coupon?.code) {
          try {
            const couponSnap = await db
              .collection('coupons')
              .where('code', '==', orderFields.coupon.code.toUpperCase())
              .limit(1)
              .get();
            if (!couponSnap.empty) {
              await couponSnap.docs[0].ref.update({
                usageCount: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          } catch (couponErr) {
            console.info(
              '[createCheckoutOrder] No se pudo incrementar usageCount del cupón:',
              couponErr instanceof Error ? couponErr.message : String(couponErr)
            );
          }
        }
      }, 'checkout createOrder');

      return { success: true };
    } catch (error) {
      if (isAdminCredentialError(error)) {
        credentialBlocked = true;
      } else {
        console.error(
          '[createCheckoutOrder] Error creating order in Firestore:',
          error instanceof Error ? error.message : String(error)
        );
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error al guardar el pedido en Firestore.',
        };
      }
    }
  }

  // Fallback autenticado para usuarios con sesión iniciada cuando Admin SDK no tiene credenciales activas
  if (credentialBlocked && userId !== 'guest' && idToken) {
    return createOrderViaUserRest(orderFields, userId, orderDocId, idToken);
  }

  return {
    success: false,
    error:
      'Las credenciales del servidor de Firebase Admin no están activas o han sido revocadas (FIREBASE_SERVICE_ACCOUNT_JSON). Inicia sesión o renueva la clave de cuenta de servicio para pedidos de invitado.',
  };
}

/**
 * Consulta el estado de un pedido (usado por la pantalla de confirmación para invitados o usuarios).
 */
export async function getCheckoutOrderStatus(
  orderId: string,
  userId?: string
): Promise<{
  exists: boolean;
  status?: string;
  total?: number;
  customerName?: string;
  customerEmail?: string;
  isGuest?: boolean;
}> {
  if (!areAdminCredentialsAvailable()) {
    return { exists: false };
  }

  try {
    const uid =
      userId ||
      (orderId.includes('_guest_') || orderId.startsWith('CPO_guest_') ? 'guest' : null);

    return await runWithAdminFirestore(async (db) => {
      if (uid) {
        const snap = await db
          .collection('users')
          .doc(uid)
          .collection('orders')
          .doc(orderId)
          .get();
        if (snap.exists) {
          const d = snap.data();
          return {
            exists: true,
            status: d?.status,
            total: d?.total,
            customerName: d?.customerName,
            customerEmail: d?.customerEmail,
            isGuest: d?.isGuest ?? uid === 'guest',
          };
        }
      }

      const groupSnap = await db
        .collectionGroup('orders')
        .where('id', '==', orderId)
        .limit(1)
        .get();
      if (!groupSnap.empty) {
        const d = groupSnap.docs[0].data();
        return {
          exists: true,
          status: d?.status,
          total: d?.total,
          customerName: d?.customerName,
          customerEmail: d?.customerEmail,
          isGuest: d?.isGuest ?? d?.userId === 'guest',
        };
      }

      return { exists: false };
    }, 'checkout getOrderStatus');
  } catch (error) {
    if (!isAdminCredentialError(error)) {
      console.info(
        '[getCheckoutOrderStatus] Error checking order status:',
        error instanceof Error ? error.message : String(error)
      );
    }
    return { exists: false };
  }
}
