'use server';

// Modificado por: Webmaster Freddy Poleo
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { enforceServerActionRateLimit } from '@/lib/server-rate-limit';
import { auth, firestore } from '@/lib/firebase-admin';
import type { Order, OrderStatus, Product } from '@/lib/types';
import {
  syncKlaviyoProduct as syncKlaviyoProductInternal,
  trackKlaviyoEvent,
  trackOrderStatusUpdateInternal,
} from '@/lib/klaviyo-server';

const ADMIN_EMAILS = new Set([
  'maryandpopper@gmail.com',
  'enriqueespincosme@gmail.com',
]);

async function requireAdminSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) throw new Error('Sesión administrativa no válida.');

  const decoded = await auth.verifySessionCookie(sessionCookie, true);
  const email = String(decoded.email || '').trim().toLowerCase();
  if (!ADMIN_EMAILS.has(email)) throw new Error('No tienes permisos de administrador.');
  return decoded;
}

/**
 * Evento de registro: el email y UID proceden exclusivamente del ID token verificado.
 * El navegador no puede elegir el destinatario de la notificación ni los datos del perfil.
 */
export async function notifyAdminNewUser(idToken: string, displayName?: string) {
  await enforceServerActionRateLimit('klaviyo-signup-notification', 10, 60 * 60 * 1000);
  if (typeof idToken !== 'string' || idToken.length < 20) {
    throw new Error('Token de registro no válido.');
  }

  const decoded = await auth.verifyIdToken(idToken, true);
  const email = String(decoded.email || '').trim().toLowerCase();
  if (!email || !decoded.uid) throw new Error('No se pudo verificar el usuario registrado.');

  const safeName = String(displayName || '')
    .replace(/[<>\r\n]/g, ' ')
    .trim()
    .slice(0, 80);

  const notificationRef = firestore.collection('securityRateLimits').doc(
    'klaviyo_signup_' + crypto.createHash('sha256').update(decoded.uid).digest('hex').slice(0, 40)
  );
  const shouldNotify = await firestore.runTransaction(async transaction => {
    const existing = await transaction.get(notificationRef);
    if (existing.exists) return false;
    transaction.create(notificationRef, {
      purpose: 'single_registration_notification',
      createdAt: new Date(),
      uidHash: crypto.createHash('sha256').update(decoded.uid).digest('hex'),
    });
    return true;
  });
  if (!shouldNotify) return { success: true, duplicate: true };

  return trackKlaviyoEvent('Admin New User Notification', 'maryandpopper@gmail.com', {
    NewUserEmail: email,
    NewUserName: safeName || email.split('@')[0],
    RegistrationDate: new Date().toISOString(),
  });
}

/**
 * Sincroniza un producto que se vuelve a leer desde Firestore.
 * El cliente solo proporciona el ID; nunca controla el contenido enviado a Klaviyo.
 */
export async function syncKlaviyoProduct(productId: string) {
  await requireAdminSession();
  const safeId = String(productId || '').trim();
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(safeId)) {
    throw new Error('Identificador de producto no válido.');
  }

  const snapshot = await firestore.collection('products').doc(safeId).get();
  if (!snapshot.exists) throw new Error('El producto que se va a sincronizar no existe.');

  const product = { ...snapshot.data(), id: snapshot.id } as Product;
  return syncKlaviyoProductInternal(product);
}

/**
 * Actualiza un estado desde el panel, verificando la sesión y leyendo el pedido en servidor.
 * La ruta debe apuntar al pedido de un usuario y no puede seleccionar otra colección.
 */
export async function updateOrderStatusWithKlaviyo(orderPath: string, newStatus: OrderStatus) {
  await requireAdminSession();

  const safePath = String(orderPath || '').trim();
  const match = /^users\/([A-Za-z0-9_-]{1,128})\/orders\/([A-Za-z0-9_-]{1,160})$/.exec(safePath);
  const allowedStatuses: OrderStatus[] = [
    'pending_payment', 'order_received', 'shipped',
    'out_for_delivery', 'delivered', 'cancelled', 'issue',
  ];
  if (!match || !allowedStatuses.includes(newStatus)) {
    throw new Error('Pedido o estado no válido.');
  }

  const orderRef = firestore.doc(safePath);
  const result = await firestore.runTransaction(async transaction => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists) throw new Error('El pedido no existe.');
    const current = snapshot.data() as Record<string, any>;
    const previousStatus = current.status as OrderStatus | undefined;
    if (previousStatus === newStatus) {
      return { changed: false, order: { ...current, id: match[2] } as Order };
    }

    transaction.update(orderRef, {
      status: newStatus,
      updatedAt: new Date(),
    });
    return {
      changed: true,
      order: { ...current, id: match[2], status: newStatus } as Order,
    };
  });

  if (result.changed) {
    const notification = await trackOrderStatusUpdateInternal(result.order, newStatus);
    return { success: true, notification };
  }
  return { success: true, unchanged: true };
}
