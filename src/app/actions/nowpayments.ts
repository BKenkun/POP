// Modificado por: Webmaster Freddy Poleo
'use server';

import { firestore } from '@/lib/firebase-admin';

/**
 * Crea una factura alojada de NOWPayments para un pedido ya guardado.
 * El estado del pedido solo cambia a order_received desde el webhook IPN verificado.
 */
export async function createNowPaymentsInvoice(orderId: string): Promise<{
  success: boolean;
  invoiceUrl?: string;
  invoiceId?: string;
  message?: string;
}> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const baseUrl = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (!apiKey || !ipnSecret) {
    return { success: false, message: 'NOWPayments no está configurado en el servidor.' };
  }
  if (!baseUrl.startsWith('https://')) {
    return { success: false, message: 'La URL pública de la tienda no está configurada correctamente.' };
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
    const orderRef = firestore.collection('users').doc(userId).collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return { success: false, message: 'No se encontró el pedido en Firestore.' };

    const order = orderSnap.data()!;
    if (order.paymentMethod !== 'nowpayments' || order.status !== 'pending_payment') {
      return { success: false, message: 'El pedido no está pendiente de pago por NOWPayments.' };
    }
    if (order.nowpaymentsInvoiceUrl) {
      return { success: true, invoiceUrl: order.nowpaymentsInvoiceUrl, invoiceId: order.nowpaymentsInvoiceId };
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
    if (!response.ok || typeof data.invoice_url !== 'string' || !data.invoice_url.startsWith('https://')) {
      console.error('[NOWPAYMENTS] Error al crear factura', {
        status: response.status,
        message: data.message || data.error || 'Respuesta inválida',
      });
      return { success: false, message: 'NOWPayments no pudo crear la factura. Inténtalo de nuevo.' };
    }

    await orderRef.set({
      nowpaymentsInvoiceId: String(data.id || ''),
      nowpaymentsInvoiceUrl: data.invoice_url,
      nowpaymentsStatus: 'waiting',
      paymentMethod: 'nowpayments',
      updatedAt: new Date(),
    }, { merge: true });

    return { success: true, invoiceUrl: data.invoice_url, invoiceId: String(data.id || '') };
  } catch (error) {
    console.error('[NOWPAYMENTS] Error creando factura:', error instanceof Error ? error.message : String(error));
    return { success: false, message: 'No se pudo iniciar el pago con NOWPayments.' };
  }
}
