// Modificado por: Webmaster Freddy Poleo
'use server';

import { firestore } from '@/lib/firebase-admin';

const API_BASE = 'https://api.packlink.com/v1';

export type PacklinkQuote = {
  serviceId: string;
  serviceName: string;
  carrierName: string;
  price: number; // EUR
  currency: string;
};

function normalizeCountryCode(value: unknown): string {
  const text = String(value || '').trim().toUpperCase();
  if (text.length === 2) return text;
  const aliases: Record<string, string> = {
    SPAIN: 'ES', ESPAÑA: 'ES', PORTUGAL: 'PT', FRANCE: 'FR', FRANCIA: 'FR',
    GERMANY: 'DE', ALEMANIA: 'DE', ITALY: 'IT', ITALIA: 'IT', BELGIUM: 'BE',
    BELGICA: 'BE', BELGIQUE: 'BE', NETHERLANDS: 'NL', HOLANDA: 'NL',
    IRELAND: 'IE', IRLANDA: 'IE', UNITED KINGDOM: 'GB', REINO UNIDO: 'GB',
  };
  return aliases[text] || text;
}

function packlinkConfig() {
  const apiKey = process.env.PACKLINK_API_KEY;
  const fromPostalCode = process.env.PACKLINK_FROM_POSTAL_CODE;
  const fromCountry = (process.env.PACKLINK_FROM_COUNTRY || 'ES').toUpperCase();
  const source = process.env.PACKLINK_SOURCE;
  if (!apiKey) throw new Error('Falta configurar PACKLINK_API_KEY en Firebase Secret Manager.');
  if (!fromPostalCode || !source) {
    throw new Error('Faltan PACKLINK_FROM_POSTAL_CODE o PACKLINK_SOURCE en Firebase App Hosting.');
  }
  return { apiKey, fromPostalCode, fromCountry, source };
}

async function packlinkRequest(path: string, init: RequestInit = {}) {
  const { apiKey } = packlinkConfig();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    console.error('[PACKLINK] API error', { path, status: response.status });
    throw new Error(response.status === 401
      ? 'Packlink PRO rechazó la clave API. Revisa PACKLINK_API_KEY.'
      : 'Packlink PRO no pudo completar la operación. Revisa la configuración y los logs.');
  }
  return body;
}

/** Consulta tarifas reales de Packlink PRO; los precios devueltos están en euros. */
export async function getPacklinkShippingQuotes(input: {
  postalCode: string;
  country: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}): Promise<{ success: boolean; quotes?: PacklinkQuote[]; message?: string }> {
  try {
    const { fromPostalCode, fromCountry, source } = packlinkConfig();
    const postalCode = String(input.postalCode || '').trim();
    const country = normalizeCountryCode(input.country);
    if (postalCode.length < 3 || country.length !== 2) {
      return { success: false, message: 'Introduce un código postal y país válidos para calcular el envío.' };
    }

    const params = new URLSearchParams({
      'from[country]': fromCountry,
      'from[zip]': fromPostalCode,
      'to[country]': country,
      'to[zip]': postalCode,
      source,
      'packages[0][height]': String(Math.ceil(input.heightCm || Number(process.env.PACKLINK_PACKAGE_HEIGHT_CM || 15))),
      'packages[0][width]': String(Math.ceil(input.widthCm || Number(process.env.PACKLINK_PACKAGE_WIDTH_CM || 20))),
      'packages[0][length]': String(Math.ceil(input.lengthCm || Number(process.env.PACKLINK_PACKAGE_LENGTH_CM || 30))),
      'packages[0][weight]': String(input.weightKg || Number(process.env.PACKLINK_PACKAGE_WEIGHT_KG || 1)),
    });
    const body = await packlinkRequest(`/services?${params.toString()}`, { method: 'GET' });
    const rows = Array.isArray(body) ? body : Array.isArray(body?.services) ? body.services : [];
    const quotes = rows.map((row: any) => ({
      serviceId: String(row.service_id ?? row.serviceId ?? row.id ?? ''),
      serviceName: String(row.service_name ?? row.serviceName ?? row.name ?? 'Envío estándar'),
      carrierName: String(row.carrier_name ?? row.carrierName ?? row.carrier ?? 'Transportista'),
      price: Number(row.price?.total_price ?? row.total_price ?? row.price?.base_price ?? row.base_price ?? row.price),
      currency: String(row.currency ?? 'EUR'),
    })).filter((q: PacklinkQuote) => q.serviceId && Number.isFinite(q.price) && q.price >= 0)
      .sort((a: PacklinkQuote, b: PacklinkQuote) => a.price - b.price);

    if (!quotes.length) return { success: false, message: 'Packlink no devolvió tarifas válidas para ese destino.' };
    return { success: true, quotes };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'No se pudieron consultar tarifas de Packlink PRO.' };
  }
}

/**
 * Crea un borrador de envío en Packlink después del pago confirmado.
 * Packlink puede requerir contratar/pagar el envío en su panel antes de publicar
 * la etiqueta definitiva; en ese caso la orden queda marcada como pendiente de etiqueta.
 */
export async function createPacklinkShipmentDraft(orderId: string): Promise<void> {
  const { fromPostalCode, fromCountry, source } = packlinkConfig();
  const parts = orderId.split('_');
  if (parts.length < 3 || parts[0] !== 'CPO') throw new Error('ID de pedido POP no válido para Packlink.');
  const userId = parts.slice(1, -1).join('_');
  const orderRef = firestore.collection('users').doc(userId).collection('orders').doc(orderId);
  const snap = await orderRef.get();
  if (!snap.exists) throw new Error('Pedido no encontrado para crear el envío Packlink.');
  const order = snap.data()!;

  if (!['order_received', 'shipped', 'out_for_delivery', 'delivered'].includes(String(order.status))) {
    throw new Error('No se crea el envío Packlink hasta confirmar el pago.');
  }
  if (!order.packlink?.serviceId || !order.packlink?.serviceName || !order.packlink?.carrierName) {
    await orderRef.set({
      packlink: { status: 'needs_service_selection', lastError: 'El pedido no contiene el servicio Packlink seleccionado en checkout.' },
      updatedAt: new Date(),
    }, { merge: true });
    return;
  }

  // Reclamar la creación dentro de una transacción para evitar borradores duplicados
  // si el proveedor de pagos reenvía el webhook simultáneamente.
  const claimed = await firestore.runTransaction(async (transaction) => {
    const currentSnap = await transaction.get(orderRef);
    if (!currentSnap.exists) return false;
    const current = currentSnap.data()!;
    const status = String(current.packlink?.status || '');
    if (current.packlink?.reference || ['creating', 'draft_created', 'label_available'].includes(status)) return false;
    transaction.update(orderRef, {
      'packlink.status': 'creating',
      'packlink.lastError': null,
      'packlink.attemptAt': new Date(),
      updatedAt: new Date(),
    });
    return true;
  });
  if (!claimed) return;

  const destination = order.shippingAddress || {};
  const senderName = process.env.PACKLINK_FROM_NAME;
  const senderStreet = process.env.PACKLINK_FROM_STREET;
  const senderCity = process.env.PACKLINK_FROM_CITY;
  const senderState = process.env.PACKLINK_FROM_STATE || process.env.PACKLINK_FROM_CITY;
  const senderPhone = process.env.PACKLINK_FROM_PHONE;
  const senderEmail = process.env.PACKLINK_FROM_EMAIL;
  if (!senderName || !senderStreet || !senderCity || !senderPhone || !senderEmail) {
    throw new Error('Faltan datos de remitente PACKLINK_FROM_NAME/STREET/CITY/PHONE/EMAIL en App Hosting.');
  }

  // Payload legacy compatible con el módulo oficial Packlink PRO para eCommerce.
  const draft = {
    platform: process.env.PACKLINK_PLATFORM || 'custom',
    platform_country: fromCountry,
    source,
    from: {
      name: senderName, street: senderStreet, city: senderCity, state: senderState,
      zip: fromPostalCode, country: fromCountry, phone: senderPhone, email: senderEmail,
    },
    to: {
      name: order.customerName, street: destination.line1 || '', city: destination.city || '',
      state: destination.state || destination.city || '', zip: destination.postal_code || '',
      country: normalizeCountryCode(destination.country || 'ES'), phone: destination.phone || '',
      email: order.customerEmail || '',
    },
    service: order.packlink.serviceName,
    carrier: order.packlink.carrierName,
    service_id: order.packlink.serviceId,
    packages: [{
      height: Number(process.env.PACKLINK_PACKAGE_HEIGHT_CM || 15),
      width: Number(process.env.PACKLINK_PACKAGE_WIDTH_CM || 20),
      length: Number(process.env.PACKLINK_PACKAGE_LENGTH_CM || 30),
      weight: Number(process.env.PACKLINK_PACKAGE_WEIGHT_KG || 1),
    }],
    content: (order.items || []).map((item: any) => String(item.name || 'Productos')).join(', ').slice(0, 60),
    contentvalue: Number(order.total || 0) / 100,
    content_second_hand: false,
    shipment_custom_reference: orderId.slice(0, 50),
    contentValue_currency: 'EUR',
    has_customs: false,
  };

  let result: any;
  try {
    result = await packlinkRequest('/shipments', { method: 'POST', body: JSON.stringify(draft) });
  } catch (error) {
    await orderRef.update({
      'packlink.status': 'creation_failed',
      'packlink.lastError': error instanceof Error ? error.message : String(error),
      updatedAt: new Date(),
    });
    throw error;
  }
  const reference = String(result?.reference || '');
  if (!reference) {
    await orderRef.update({ 'packlink.status': 'creation_failed', 'packlink.lastError': 'Packlink no devolvió la referencia del envío.', updatedAt: new Date() });
    throw new Error('Packlink no devolvió la referencia del envío.');
  }

  await orderRef.update({
    'packlink.reference': reference,
    'packlink.serviceId': order.packlink.serviceId,
    'packlink.serviceName': order.packlink.serviceName,
    'packlink.carrierName': order.packlink.carrierName,
    'packlink.quotedPrice': order.packlink.quotedPrice ?? null,
    'packlink.status': 'draft_created',
    'packlink.labelUrl': null,
    'packlink.trackingUrl': null,
    'packlink.createdAt': new Date(),
    updatedAt: new Date(),
  });

  // Intentar recuperar la etiqueta si el transportista/estado ya la ha generado.
  try {
    const labels = await packlinkRequest(`/shipments/${encodeURIComponent(reference)}/labels`, { method: 'GET' });
    const labelUrl = Array.isArray(labels) ? labels.find((v: unknown) => typeof v === 'string') : labels?.label_url || labels?.url || labels?.labels?.[0]?.url;
    if (typeof labelUrl === 'string' && labelUrl.startsWith('https://')) {
      await orderRef.update({ 'packlink.labelUrl': labelUrl, 'packlink.status': 'label_available', updatedAt: new Date() });
    } else {
      await orderRef.update({ 'packlink.status': 'draft_created_label_pending', updatedAt: new Date() });
    }
  } catch (error) {
    console.warn('[PACKLINK] El borrador se creó pero la etiqueta aún no está disponible.', {
      orderId,
      reference,
      error: error instanceof Error ? error.message : String(error),
    });
    await orderRef.set({ packlink: { status: 'draft_created_label_pending' }, updatedAt: new Date() }, { merge: true });
  }
}
