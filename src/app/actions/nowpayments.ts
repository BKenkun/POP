// Modificado por: Webmaster Freddy Poleo
'use server';

import { firestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getAuthorizedCheckoutOrder, type CheckoutAccess } from '@/lib/checkout-security';

/**
 * Creates a NOWPayments invoice only for an order owned by the caller.
 * The amount, payment method and order status are read from Firestore, never from the browser.
 */
export async function createNowPaymentsInvoice(
  orderId: string,
  access: CheckoutAccess = {},
): Promise<{
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
  if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(baseUrl)) {
    return { success: false, message: 'La URL pública de la tienda no está configurada correctamente.' };
  }

  try {
    const { orderRef, order } = await getAuthorizedCheckoutOrder(orderId, access);

    if (order.paymentMethod !== 'nowpayments' || order.status !== 'pending_payment') {
      return { success: false, message: 'El pedido no está pendiente de pago por NOWPayments.' };
    }

    const totalCents = Number(order.total);
    if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
      return { success: false, message: 'El importe del pedido no es válido.' };
    }

    const claim = await firestore.runTransaction(async (transaction) => {
      const currentSnapshot = await transaction.get(orderRef);
      if (!currentSnapshot.exists) throw new Error('No se encontró el pedido.');
      const current = currentSnapshot.data()!;

      if (current.paymentMethod !== 'nowpayments' || current.status !== 'pending_payment') {
        throw new Error('El pedido ya no está pendiente de pago.');
      }

      if (typeof current.nowpaymentsInvoiceUrl === 'string' &&
          current.nowpaymentsInvoiceUrl.startsWith('https://')) {
        return {
          existingUrl: current.nowpaymentsInvoiceUrl,
          existingId: String(current.nowpaymentsInvoiceId || ''),
          claimed: false,
        };
      }

      const lastAttempt = current.nowpaymentsInvoiceAttemptAt?.toDate?.().getTime?.() || 0;
      if (current.nowpaymentsInvoiceStatus === 'creating' && Date.now() - lastAttempt < 120000) {
        return { existingUrl: '', existingId: '', claimed: false };
      }

      transaction.update(orderRef, {
        nowpaymentsInvoiceStatus: 'creating',
        nowpaymentsInvoiceAttemptAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { existingUrl: '', existingId: '', claimed: true };
    });

    if (claim.existingUrl) {
      return { success: true, invoiceUrl: claim.existingUrl, invoiceId: claim.existingId };
    }
    if (!claim.claimed) {
      return { success: false, message: 'El pago se está preparando. Espera unos segundos e inténtalo de nuevo.' };
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
        order_description: 'Comprar Popper Online - pedido ' + orderId,
        ipn_callback_url: baseUrl + '/api/webhooks/nowpayments',
        success_url: baseUrl + '/checkout/success?order_id=' + encodeURIComponent(orderId),
        cancel_url: baseUrl + '/checkout?payment=cancelled',
        is_fixed_rate: process.env.NOWPAYMENTS_FIXED_RATE === 'true',
        is_fee_paid_by_user: process.env.NOWPAYMENTS_FEE_PAID_BY_USER === 'true',
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.invoice_url !== 'string' || !data.invoice_url.startsWith('https://')) {
      await orderRef.set({
        nowpaymentsInvoiceStatus: 'creation_failed',
        nowpaymentsInvoiceAttemptAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      console.error('[NOWPAYMENTS] Error al crear factura', {
        status: response.status,
        message: data.message || data.error || 'Respuesta inválida',
      });
      return { success: false, message: 'NOWPayments no pudo crear la factura. Inténtalo de nuevo.' };
    }

    const invoiceId = String(data.id || '');
    await orderRef.set({
      nowpaymentsInvoiceId: invoiceId,
      nowpaymentsInvoiceUrl: data.invoice_url,
      nowpaymentsInvoiceStatus: 'created',
      nowpaymentsStatus: 'waiting',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true, invoiceUrl: data.invoice_url, invoiceId };
  } catch (error) {
    console.error('[NOWPAYMENTS] Error creando factura:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      message: error instanceof Error ? error.message : 'No se pudo iniciar el pago con NOWPayments.',
    };
  }
}
