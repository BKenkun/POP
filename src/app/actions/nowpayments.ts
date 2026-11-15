// Modificado por: Webmaster Freddy Poleo
'use server';

import {
  auth,
  projectId,
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminFirestore,
  fromFirestoreRestValue,
  toFirestoreRestValue,
} from '@/lib/firebase-admin';

async function readOrderViaUserRest(
  userId: string,
  orderId: string,
  idToken: string
): Promise<Record<string, any> | null> {
  const decoded = await auth.verifyIdToken(idToken);
  if (decoded.uid !== userId) {
    return null;
  }

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents/users/${encodeURIComponent(
    userId
  )}/orders/${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  const docJson = (await res.json()) as { fields?: Record<string, any> };
  if (!docJson.fields) return null;

  const parsed: Record<string, any> = {};
  for (const [k, v] of Object.entries(docJson.fields)) {
    parsed[k] = fromFirestoreRestValue(v);
  }
  return parsed;
}

async function updateOrderInvoiceViaUserRest(
  userId: string,
  orderId: string,
  idToken: string,
  invoiceId: string,
  invoiceUrl: string
): Promise<void> {
  const updateFields = [
    'nowpaymentsInvoiceId',
    'nowpaymentsInvoiceUrl',
    'nowpaymentsStatus',
    'paymentMethod',
    'updatedAt',
  ];
  const maskParams = updateFields.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents/users/${encodeURIComponent(
    userId
  )}/orders/${encodeURIComponent(orderId)}?${maskParams}`;

  await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        nowpaymentsInvoiceId: toFirestoreRestValue(invoiceId),
        nowpaymentsInvoiceUrl: toFirestoreRestValue(invoiceUrl),
        nowpaymentsStatus: toFirestoreRestValue('waiting'),
        paymentMethod: toFirestoreRestValue('nowpayments'),
        updatedAt: toFirestoreRestValue(new Date()),
      },
    }),
    cache: 'no-store',
  });
}

/**
 * Crea una factura alojada de NOWPayments para un pedido ya guardado.
 * El estado del pedido solo cambia a order_received desde el webhook IPN verificado.
 */
export async function createNowPaymentsInvoice(
  orderId: string,
  idToken?: string
): Promise<{
  success: boolean;
  invoiceUrl?: string;
  invoiceId?: string;
  message?: string;
}> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const baseUrl = (
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://comprarpopperonline.com'
  ).replace(/\/$/, '');
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (!apiKey || !ipnSecret) {
    return { success: false, message: 'NOWPayments no está configurado en el servidor.' };
  }
  if (!baseUrl.startsWith('https://')) {
    return {
      success: false,
      message: 'La URL pública de la tienda no está configurada correctamente.',
    };
  }

  // Los pedidos de checkout siguen el formato CPO_<uid>_<timestamp>.
  const parts = orderId.split('_');
  if (parts.length < 3 || parts[0] !== 'CPO') {
    return { success: false, message: 'El identificador del pedido no es válido.' };
  }
  const timestamp = parts[parts.length - 1];
  const userId = parts.slice(1, -1).join('_');
  if (!userId || !/^\d+$/.test(timestamp)) {
    return { success: false, message: 'No se pudo identificar el pedido.' };
  }

  try {
    let order: Record<string, any> | null = null;
    let usedRestFallback = false;

    if (areAdminCredentialsAvailable()) {
      try {
        order = await runWithAdminFirestore(async (db) => {
          const orderRef = db
            .collection('users')
            .doc(userId)
            .collection('orders')
            .doc(orderId);
          const orderSnap = await orderRef.get();
          return orderSnap.exists ? (orderSnap.data() as Record<string, any>) : null;
        }, 'nowpayments readOrder');
      } catch (err) {
        if (!isAdminCredentialError(err)) {
          throw err;
        }
      }
    }

    if (!order && userId !== 'guest' && idToken) {
      order = await readOrderViaUserRest(userId, orderId, idToken);
      usedRestFallback = true;
    }

    if (!order) {
      return { success: false, message: 'No se encontró el pedido en Firestore.' };
    }

    if (order.paymentMethod !== 'nowpayments' || order.status !== 'pending_payment') {
      return {
        success: false,
        message: 'El pedido no está pendiente de pago por NOWPayments.',
      };
    }
    if (order.nowpaymentsInvoiceUrl) {
      return {
        success: true,
        invoiceUrl: order.nowpaymentsInvoiceUrl,
        invoiceId: order.nowpaymentsInvoiceId,
      };
    }

    const totalCents = Number(order.total);
    if (!Number.isFinite(totalCents) || totalCents <= 0) {
      return { success: false, message: 'El importe del pedido no es válido.' };
    }

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: (totalCents / 100).toFixed(2),
        price_currency: process.env.NOWPAYMENTS_PRICE_CURRENCY || 'eur',
        order_id: orderId,
        order_description: `Comprar Popper Online - pedido ${orderId}`,
        ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
        success_url: `${baseUrl}/checkout/success?order_id=${encodeURIComponent(orderId)}`,
        cancel_url: `${baseUrl}/checkout?payment=cancelled`,
        is_fixed_rate: process.env.NOWPAYMENTS_FIXED_RATE === 'true',
        is_fee_paid_by_user: process.env.NOWPAYMENTS_FEE_PAID_BY_USER === 'true',
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    if (
      !response.ok ||
      typeof data.invoice_url !== 'string' ||
      !data.invoice_url.startsWith('https://')
    ) {
      console.error('[NOWPAYMENTS] Error al crear factura', {
        status: response.status,
        message: data.message || data.error || 'Respuesta inválida',
      });
      return {
        success: false,
        message: 'NOWPayments no pudo crear la factura. Inténtalo de nuevo.',
      };
    }

    const invoiceId = String(data.id || '');
    if (!usedRestFallback && areAdminCredentialsAvailable()) {
      await runWithAdminFirestore(async (db) => {
        await db
          .collection('users')
          .doc(userId)
          .collection('orders')
          .doc(orderId)
          .set(
            {
              nowpaymentsInvoiceId: invoiceId,
              nowpaymentsInvoiceUrl: data.invoice_url,
              nowpaymentsStatus: 'waiting',
              paymentMethod: 'nowpayments',
              updatedAt: new Date(),
            },
            { merge: true }
          );
      }, 'nowpayments updateInvoice');
    } else if (userId !== 'guest' && idToken) {
      await updateOrderInvoiceViaUserRest(userId, orderId, idToken, invoiceId, data.invoice_url);
    }

    return { success: true, invoiceUrl: data.invoice_url, invoiceId };
  } catch (error) {
    console.error(
      '[NOWPAYMENTS] Error creando factura:',
      error instanceof Error ? error.message : String(error)
    );
    return { success: false, message: 'No se pudo iniciar el pago con NOWPayments.' };
  }
}
