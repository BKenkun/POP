'use server';

/**
 * Crea un pedido vía POST /api/orders de Hilow (servidor → Hilow).
 * `yourStoreUrl` suele ser `window.location.origin` en el cliente para success/cancel correctos en cada entorno.
 */

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function getHilowApiBaseUrl(): string {
  const raw = process.env.HILOW_API_BASE_URL || 'https://hilowglobal.com';
  return normalizeBaseUrl(raw);
}

function getHilowPayOrigin(): string {
  const raw = process.env.HILOW_PAY_ORIGIN || getHilowApiBaseUrl();
  return normalizeBaseUrl(raw);
}

interface HilowApiResponse {
  hilowOrderId?: string;
  message?: string;
}

function errorMessageFromBody(status: number, bodyText: string): string {
  if (!bodyText.trim()) {
    return `La API de Hilow falló con estado ${status}`;
  }
  try {
    const data = JSON.parse(bodyText) as { message?: string };
    return data.message || bodyText;
  } catch {
    return bodyText.length > 200 ? `${bodyText.slice(0, 200)}…` : bodyText;
  }
}

export async function createHilowApiOrder(
  yourInternalOrderId: string,
  amountInCents: number,
  productName: string,
  isSubscription: boolean,
  yourStoreUrl: string
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
  try {
    const HILOW_API_KEY = process.env.HILOW_API_KEY;

    if (!HILOW_API_KEY) {
      throw new Error('La HILOW_API_KEY no está configurada en el servidor.');
    }

    const appBase = normalizeBaseUrl(yourStoreUrl);
    let hostname: string;
    try {
      hostname = new URL(appBase).hostname;
    } catch {
      throw new Error('URL de tienda inválida (yourStoreUrl).');
    }

    const storeId = process.env.HILOW_STORE_ID || hostname;

    const successUrl = `${appBase}/checkout/success?order_id=${encodeURIComponent(yourInternalOrderId)}`;
    const cancelUrl = `${appBase}/checkout`;

    const payload = {
      storeId,
      internalOrderId: yourInternalOrderId,
      amountInCents,
      productName,
      isSubscription,
      successUrl,
      cancelUrl,
    };

    const apiBase = getHilowApiBaseUrl();
    const response = await fetch(`${apiBase}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HILOW_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    let responseData: HilowApiResponse;
    try {
      responseData = responseText ? (JSON.parse(responseText) as HilowApiResponse) : {};
    } catch {
      if (!response.ok) {
        throw new Error(errorMessageFromBody(response.status, responseText));
      }
      throw new Error('Respuesta inválida de la API de Hilow.');
    }

    if (!response.ok) {
      throw new Error(responseData.message || errorMessageFromBody(response.status, responseText));
    }

    if (!responseData.hilowOrderId) {
      throw new Error('La API de Hilow no devolvió hilowOrderId.');
    }

    const payOrigin = getHilowPayOrigin();
    const checkoutUrl = `${payOrigin}/pay/${responseData.hilowOrderId}`;

    return { success: true, checkoutUrl };
  } catch (error) {
    console.error('Error al crear el pedido en la API de Hilow:', error);
    return {
      success: false,
      message: (error as Error).message || 'Fallo al conectar con el servicio de pago.',
    };
  }
}
