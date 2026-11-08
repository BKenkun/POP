// Modificado por: Webmaster Freddy Poleo
'use server';

import { firestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getAuthorizedCheckoutOrder, type CheckoutAccess } from '@/lib/checkout-security';

interface HilowApiResponse {
  hilowOrderId?: string;
  message?: string;
}

/**
 * Creates a HiLow payment session from a server-verified pending order.
 * No amount, customer ID, product name or return URL is accepted from the browser.
 */
export async function createHilowApiOrder(
  orderId: string,
  access: CheckoutAccess = {},
): Promise<{ success: boolean; checkoutUrl?: string; orderId?: string; message?: string }> {
  const apiKey = process.env.HILOW_API_KEY;
  const appBaseUrl = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const storeId = process.env.HILOW_STORE_ID || 'comprarpopperonline.com';

  if (!apiKey) return { success: false, message: 'HiLow no está configurado en el servidor.' };
  if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(appBaseUrl)) {
    return { success: false, message: 'La URL pública de la tienda no está configurada correctamente.' };
  }

  try {
    const { orderRef, order } = await getAuthorizedCheckoutOrder(orderId, access);

    if (order.paymentMethod !== 'hilow' || order.status !== 'pending_payment') {
      return { success: false, message: 'El pedido no está pendiente de pago con HiLow.' };
    }

    const amountInCents = Number(order.total);
    if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
      return { success: false, message: 'El importe del pedido no es válido.' };
    }

    const claim = await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(orderRef);
      if (!snapshot.exists) throw new Error('No se encontró el pedido.');
      const current = snapshot.data()!;

      if (current.paymentMethod !== 'hilow' || current.status !== 'pending_payment') {
        throw new Error('El pedido ya no está pendiente de pago.');
      }

      if (typeof current.hilowCheckoutUrl === 'string' &&
          current.hilowCheckoutUrl.startsWith('https://hilowglobal.com/pay/')) {
        return { existingUrl: current.hilowCheckoutUrl, claimed: false };
      }

      const lastAttempt = current.hilowInvoiceAttemptAt?.toDate?.().getTime?.() || 0;
      if (current.hilowInvoiceStatus === 'creating' && Date.now() - lastAttempt < 120000) {
        return { existingUrl: '', claimed: false };
      }

      transaction.update(orderRef, {
        hilowInvoiceStatus: 'creating',
        hilowInvoiceAttemptAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { existingUrl: '', claimed: true };
    });

    if (claim.existingUrl) {
      return { success: true, checkoutUrl: claim.existingUrl, orderId };
    }
    if (!claim.claimed) {
      return { success: false, message: 'El pago se está preparando. Espera unos segundos e inténtalo de nuevo.' };
    }

    const productName = (Array.isArray(order.items) ? order.items : [])
      .map((item: { quantity?: number; name?: string }) =>
        String(item.quantity || 1) + 'x ' + String(item.name || 'Producto')
      )
      .join(', ')
      .slice(0, 180);

    const payload = {
      storeId,
      internalOrderId: orderId,
      amountInCents,
      productName: productName || 'Comprar Popper Online',
      isSubscription: false,
      successUrl: appBaseUrl + '/checkout/success?order_id=' + encodeURIComponent(orderId),
      cancelUrl: appBaseUrl + '/checkout?payment=cancelled',
    };

    const response = await fetch('https://hilowglobal.com/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const responseText = await response.text();
    let responseData: HilowApiResponse = {};
    try {
      responseData = responseText ? JSON.parse(responseText) as HilowApiResponse : {};
    } catch {
      responseData = {};
    }

    if (!response.ok || typeof responseData.hilowOrderId !== 'string' || !responseData.hilowOrderId) {
      await orderRef.set({
        hilowInvoiceStatus: 'creation_failed',
        hilowInvoiceAttemptAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      console.error('[HILOW] Error al crear la sesión de pago:', { status: response.status });
      return { success: false, message: responseData.message || 'HiLow no pudo iniciar el pago.' };
    }

    const checkoutUrl = 'https://hilowglobal.com/pay/' + encodeURIComponent(responseData.hilowOrderId);
    await orderRef.set({
      hilowOrderId: responseData.hilowOrderId,
      hilowCheckoutUrl: checkoutUrl,
      hilowInvoiceStatus: 'created',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true, checkoutUrl, orderId };
  } catch (error) {
    console.error('[HILOW] Error iniciando pago:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      message: error instanceof Error ? error.message : 'No se pudo iniciar el pago con HiLow.',
    };
  }
}
