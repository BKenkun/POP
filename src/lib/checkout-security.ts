import crypto from 'crypto';
import admin from 'firebase-admin';
import { firestore } from '@/lib/firebase-admin';

export type CheckoutAccess = {
  idToken?: string;
  guestAccessToken?: string;
};

export type AuthorizedCheckoutOrder = {
  userId: string;
  orderRef: FirebaseFirestore.DocumentReference;
  order: FirebaseFirestore.DocumentData;
};

/**
 * Resolves an order only after proving ownership.
 * Authenticated orders require a valid, non-revoked Firebase ID token.
 * Guest orders require the high-entropy capability token returned at checkout.
 */
export async function getAuthorizedCheckoutOrder(
  orderId: string,
  access: CheckoutAccess = {},
): Promise<AuthorizedCheckoutOrder> {
  if (typeof orderId !== 'string' || !orderId.startsWith('CPO_') || orderId.length > 180) {
    throw new Error('Identificador de pedido no válido.');
  }

  const separator = orderId.lastIndexOf('_');
  if (separator <= 4 || !/^\d{10,16}$/.test(orderId.slice(separator + 1))) {
    throw new Error('Identificador de pedido no válido.');
  }

  const userId = orderId.slice(4, separator);
  if (!userId || userId.includes('/')) {
    throw new Error('Identificador de pedido no válido.');
  }

  const orderRef = firestore.collection('users').doc(userId).collection('orders').doc(orderId);
  const snapshot = await orderRef.get();
  if (!snapshot.exists) {
    throw new Error('No se encontró el pedido.');
  }

  const order = snapshot.data()!;

  if (userId === 'guest') {
    const supplied = String(access.guestAccessToken || '');
    const storedHash = String(order.guestAccessTokenHash || '');
    if (!/^[a-f0-9]{64}$/i.test(supplied) || !/^[a-f0-9]{64}$/i.test(storedHash)) {
      throw new Error('No tienes autorización para consultar este pedido.');
    }

    const suppliedHash = crypto.createHash('sha256').update(supplied).digest('hex');
    const left = Buffer.from(suppliedHash, 'hex');
    const right = Buffer.from(storedHash, 'hex');
    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
      throw new Error('No tienes autorización para consultar este pedido.');
    }
  } else {
    const idToken = String(access.idToken || '');
    if (!idToken) {
      throw new Error('Inicia sesión para acceder a este pedido.');
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken, true);
    } catch {
      throw new Error('La sesión ha caducado. Inicia sesión de nuevo.');
    }

    if (decoded.uid !== userId) {
      throw new Error('No tienes autorización para acceder a este pedido.');
    }
  }

  return { userId, orderRef, order };
}
